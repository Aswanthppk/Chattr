import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// State
let onlineUsers = 0;
// Queue of waiting users: { socketId, userId, name, interests, blockedUsers, joinedAt }
const waitingQueue = [];
// Active rooms: roomId -> { user1, user2 }
const activeRooms = new Map();

const ICEBREAKERS = [
  "What's a piece of speculative tech from sci-fi you genuinely wish existed today?",
  "What song instantly transports you to a vivid, specific memory?",
  "If you had to live inside any fictional or game universe for a week, which would you pick?",
  "What is a passion project you've always wanted to build or explore?",
  "What's the best hidden gem movie or book you've discovered recently?",
  "If you could travel anywhere tomorrow without worrying about cost, where would you land?",
  "What's a hobby you picked up recently or have always wanted to try?",
  "If you could have dinner with anyone from history, who would it be?"
];

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('onlineCount', Math.max(1, onlineUsers));

  console.log(`[Socket Connected] ${socket.id} (Online: ${onlineUsers})`);

  socket.on('getOnlineCount', () => {
    socket.emit('onlineCount', Math.max(1, onlineUsers));
  });

  // User requests to find a match
  socket.on('findMatch', (userData) => {
    const { userId, name, interests = [], blockedUsers = [] } = userData;

    // Remove any existing entry for this socket from the queue
    removeFromQueue(socket.id);

    const userInterestsLower = interests.map((t) => t.toLowerCase().trim());
    const hasUserInterests = userInterestsLower.length > 0;

    // Look for compatible match in queue
    let matchIndex = -1;

    if (hasUserInterests) {
      // 1. If user selected interests: match with the first candidate who shares AT LEAST ONE interest
      for (let i = 0; i < waitingQueue.length; i++) {
        const candidate = waitingQueue[i];
        if (candidate.socketId === socket.id) continue;
        if (blockedUsers.includes(candidate.userId)) continue;
        if (candidate.blockedUsers && candidate.blockedUsers.includes(userId)) continue;

        const candidateInterestsLower = candidate.interests.map((t) => t.toLowerCase().trim());
        const hasOverlap = candidateInterestsLower.some((t) => userInterestsLower.includes(t));

        if (hasOverlap) {
          matchIndex = i;
          break; // At least one interest matched! Pair immediately into chat
        }
      }
    } else {
      // 2. If NO interests are selected: match with random stranger (FIFO)
      // First try to match with someone who also chose random (0 interests)
      for (let i = 0; i < waitingQueue.length; i++) {
        const candidate = waitingQueue[i];
        if (candidate.socketId === socket.id) continue;
        if (blockedUsers.includes(candidate.userId)) continue;
        if (candidate.blockedUsers && candidate.blockedUsers.includes(userId)) continue;

        if (candidate.interests.length === 0) {
          matchIndex = i;
          break;
        }
      }

      // If no other 0-interest stranger is waiting, match with the first available waiting user
      if (matchIndex === -1) {
        for (let i = 0; i < waitingQueue.length; i++) {
          const candidate = waitingQueue[i];
          if (candidate.socketId === socket.id) continue;
          if (blockedUsers.includes(candidate.userId)) continue;
          if (candidate.blockedUsers && candidate.blockedUsers.includes(userId)) continue;

          matchIndex = i;
          break;
        }
      }
    }

    if (matchIndex !== -1) {
      const partner = waitingQueue.splice(matchIndex, 1)[0];
      const partnerSocket = io.sockets.sockets.get(partner.socketId);

      if (!partnerSocket) {
        waitingQueue.push({ socketId: socket.id, userId, name, interests, blockedUsers, joinedAt: Date.now() });
        socket.emit('queueStatus', { waiting: true });
        return;
      }

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      socket.join(roomId);
      partnerSocket.join(roomId);

      activeRooms.set(roomId, {
        user1: { socketId: socket.id, userId, name, interests },
        user2: { socketId: partner.socketId, userId: partner.userId, name: partner.name, interests: partner.interests }
      });

      // Calculate shared interests
      const sharedInterests = interests.filter((t) =>
        partner.interests.some((pi) => pi.toLowerCase().trim() === t.toLowerCase().trim())
      );

      let effectiveShared = sharedInterests;
      if (effectiveShared.length === 0) {
        if (interests.length > 0 && partner.interests.length > 0) {
          effectiveShared = [interests[0], partner.interests[0]];
        } else if (interests.length > 0) {
          effectiveShared = interests.slice(0, 2);
        } else if (partner.interests.length > 0) {
          effectiveShared = partner.interests.slice(0, 2);
        } else {
          effectiveShared = ['Serendipity', 'Random Chat'];
        }
      }

      const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

      console.log(`[Match Made] Room: ${roomId} between ${name} (${socket.id}) & ${partner.name} (${partner.socketId})`);

      // Notify both clients
      socket.emit('matchFound', {
        roomId,
        partner: {
          id: partner.userId || partner.socketId,
          name: partner.name,
          country: 'Online Orbit',
          flag: '🌐',
          avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
          status: 'Ready to talk now',
          interests: effectiveShared,
          icebreaker
        }
      });

      partnerSocket.emit('matchFound', {
        roomId,
        partner: {
          id: userId || socket.id,
          name,
          country: 'Online Orbit',
          flag: '🌐',
          avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
          status: 'Ready to talk now',
          interests: effectiveShared,
          icebreaker
        }
      });
    } else {
      waitingQueue.push({ socketId: socket.id, userId, name, interests, blockedUsers, joinedAt: Date.now() });
      console.log(`[Queue Added] ${name} (${socket.id}) waiting. Interests: [${interests.join(', ')}]. Total waiting: ${waitingQueue.length}`);
      socket.emit('queueStatus', { waiting: true });
    }
  });

  // User cancels matching search
  socket.on('cancelMatch', () => {
    removeFromQueue(socket.id);
    console.log(`[Queue Cancelled] ${socket.id}`);
  });

  // User sends message in chat
  socket.on('sendMessage', ({ roomId, text, senderName, createdAt }) => {
    if (!roomId || !text) return;
    const timeMs = (typeof createdAt === 'number' && createdAt > 0) ? createdAt : Date.now();
    const msg = {
      id: `msg_${timeMs}_${Math.random().toString(36).substring(2, 6)}`,
      senderSocketId: socket.id,
      senderName,
      text,
      createdAt: timeMs,
      timestamp: new Date(timeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };

    socket.to(roomId).emit('messageReceived', msg);
    socket.emit('messageDelivered', { tempId: msg.id });
  });

  // User typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    if (!roomId) return;
    socket.to(roomId).emit('partnerTyping', { isTyping });
  });

  // User leaves chat or ends chat
  socket.on('leaveChat', ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit('partnerLeft');
    socket.leave(roomId);
    activeRooms.delete(roomId);
    console.log(`[Chat Left] ${socket.id} left ${roomId}`);
  });

  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit('onlineCount', Math.max(1, onlineUsers));
    removeFromQueue(socket.id);

    for (const [roomId, room] of activeRooms.entries()) {
      if (room.user1.socketId === socket.id || room.user2.socketId === socket.id) {
        socket.to(roomId).emit('partnerLeft');
        activeRooms.delete(roomId);
        break;
      }
    }

    console.log(`[Socket Disconnected] ${socket.id} (Online: ${onlineUsers})`);
  });
});

function removeFromQueue(socketId) {
  const idx = waitingQueue.findIndex((u) => u.socketId === socketId);
  if (idx !== -1) {
    waitingQueue.splice(idx, 1);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlineUsers, waiting: waitingQueue.length });
});

// Serve frontend in production if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Chattr. realtime server running on http://localhost:${PORT}`);
});
