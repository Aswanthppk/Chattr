import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sqliteDb from './sqliteDb.js';
import { getGeoDetails } from './geoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env environment file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valParts] = trimmed.split('=');
      const val = valParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const app = express();
app.set('trust proxy', 1);

// HTTPS Enforcement, Canonical Domain Redirect, & HSTS Security Headers Middleware
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const xfp = req.headers['x-forwarded-proto'];

  // Check Cloudflare visitor header if present
  let isHttps = req.secure || xfp === 'https';
  if (!isHttps && req.headers['cf-visitor']) {
    try {
      const visitor = JSON.parse(req.headers['cf-visitor']);
      if (visitor && visitor.scheme === 'https') {
        isHttps = true;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // 1. Only redirect HTTP to HTTPS when proxy explicitly indicates incoming protocol is 'http'
  if (xfp === 'http' && !isHttps) {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  // 2. Canonical www to non-www redirect (https://www.chattr.world -> https://chattr.world)
  if (host.startsWith('www.')) {
    const canonicalHost = host.replace(/^www\./, '');
    return res.redirect(301, `https://${canonicalHost}${req.url}`);
  }

  // 3. Security Headers for Page Experience & HTTPS Validation
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
});

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

// Admin Authentication Config & Obscure Path
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
const ADMIN_ROUTE_PATH = process.env.ADMIN_ROUTE_PATH;

// Active Session Tokens Store (Token -> { email, createdAt })
const validAdminTokens = new Map();

function generateAdminToken(email) {
  const payload = `${email}:${Date.now()}:${Math.random()}`;
  const token = 'admin_tok_' + crypto.createHmac('sha256', ADMIN_SECRET_KEY).update(payload).digest('hex');
  validAdminTokens.set(token, { email, createdAt: Date.now() });
  return token;
}

function verifyAdminToken(token) {
  if (!token) return false;
  const session = validAdminTokens.get(token);
  if (!session) return false;
  // Token valid for 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    validAdminTokens.delete(token);
    return false;
  }
  return session;
}

// Middleware to protect admin APIs
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.headers['x-admin-token'];

  const session = verifyAdminToken(token);
  if (!session) {
    return res.status(403).json({ error: '403 Forbidden: Administrator authorization required.' });
  }

  req.admin = session;
  next();
}

// State & Administration Config
let onlineUsers = 0;
const connectedUsers = new Map(); // socketId -> { socketId, userId, name, interests, status, chatType, connectedAt }
const waitingQueue = []; // { socketId, userId, name, interests, blockedUsers, joinedAt }
const activeRooms = new Map(); // roomId -> { roomId, user1, user2, isAi, startedAt }
const activeAiTimerMap = new Map(); // socketId -> setTimeout handle

// Admin Controlled Settings (Persistent via SQLite Database)
const adminSettings = sqliteDb.getSettings();

function getPublicOnlineCount() {
  const baseCount = Math.max(1, onlineUsers);
  const offset = typeof adminSettings.fakeUserOffset === 'number' ? adminSettings.fakeUserOffset : 0;
  const mult = typeof adminSettings.fakeUserMultiplier === 'number' ? adminSettings.fakeUserMultiplier : 1.0;
  return Math.max(1, Math.round(baseCount * mult) + offset);
}

function broadcastOnlineCount() {
  io.emit('onlineCount', getPublicOnlineCount());
}

function addAuditLog(action, details) {
  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    admin: ADMIN_EMAIL,
    action,
    details
  };
  sqliteDb.addAuditLog(entry);
  broadcastAdminStats();
}

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

// Socket.IO Admin Namespace
const adminNamespace = io.of('/admin');

adminNamespace.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.['x-admin-token'];
  if (!verifyAdminToken(token)) {
    return next(new Error('403 Forbidden: Invalid Admin Token'));
  }
  next();
});

adminNamespace.on('connection', (socket) => {
  console.log(`[Admin Socket Connected] ${socket.id}`);
  socket.emit('admin:stats', getAdminStatsPayload());

  socket.on('requestStats', () => {
    socket.emit('admin:stats', getAdminStatsPayload());
  });
});

function getAdminStatsPayload() {
  let aiChatsCount = 0;
  for (const room of activeRooms.values()) {
    if (room.isAi) aiChatsCount++;
  }

  return {
    realUsersOnline: Math.max(0, onlineUsers),
    publicOnlineCount: getPublicOnlineCount(),
    activeChats: activeRooms.size,
    waitingUsers: waitingQueue.length,
    aiChats: aiChatsCount,
    serverStatus: {
      socketIo: 'Online',
      matchingService: 'Running',
      aiService: adminSettings.aiEnabled ? 'Running' : 'Disabled',
      database: 'SQLite 3 (data/chattr.db)',
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.floor(process.uptime()),
      connections: onlineUsers
    },
    databaseStatus: sqliteDb.getStats(),
    settings: adminSettings
  };
}

function broadcastAdminStats() {
  adminNamespace.emit('admin:stats', getAdminStatsPayload());
}

// User Sockets Connection
io.on('connection', (socket) => {
  const geo = getGeoDetails(socket);
  onlineUsers++;
  connectedUsers.set(socket.id, {
    socketId: socket.id,
    userId: `user_${socket.id.substring(0, 6)}`,
    name: 'Anonymous Stranger',
    country: geo.country,
    countryCode: geo.countryCode,
    flag: geo.flag,
    city: geo.city,
    ip: geo.ip,
    interests: [],
    status: 'Idle',
    chatType: 'None',
    connectedAt: Date.now()
  });

  io.emit('onlineCount', Math.max(1, onlineUsers));
  broadcastAdminStats();

  console.log(`[Socket Connected] ${socket.id} from ${geo.country} ${geo.flag} (IP: ${geo.ip}) (Online: ${onlineUsers})`);

  socket.on('getOnlineCount', () => {
    socket.emit('onlineCount', Math.max(1, onlineUsers));
  });

  // User requests to find a match
  socket.on('findMatch', (userData) => {
    const { userId, name, interests = [], blockedUsers = [], chatMode = 'text' } = userData;
    const reqChatMode = chatMode === 'video' ? 'video' : 'text';

    // Update connection metadata
    const conn = connectedUsers.get(socket.id);
    if (conn) {
      conn.userId = userId || conn.userId;
      conn.name = name || conn.name;
      conn.interests = interests;
      conn.status = 'Matching';
      conn.chatMode = reqChatMode;
    }

    // Remove any existing entry for this socket from the queue
    removeFromQueue(socket.id);
    clearAiTimer(socket.id);

    const userInterestsLower = interests.map((t) => t.toLowerCase().trim());
    const hasUserInterests = userInterestsLower.length > 0;

    // 1. Look for compatible REAL HUMAN match in queue FIRST (Human priority + Chat Mode Isolation)
    let matchIndex = -1;

    if (hasUserInterests) {
      for (let i = 0; i < waitingQueue.length; i++) {
        const candidate = waitingQueue[i];
        if (candidate.socketId === socket.id) continue;
        if (candidate.chatMode !== reqChatMode) continue; // STRICT ISOLATION: Video matches Video, Text matches Text
        if (blockedUsers.includes(candidate.userId)) continue;
        if (candidate.blockedUsers && candidate.blockedUsers.includes(userId)) continue;

        const candidateInterestsLower = candidate.interests.map((t) => t.toLowerCase().trim());
        const hasOverlap = candidateInterestsLower.some((t) => userInterestsLower.includes(t));

        if (hasOverlap) {
          matchIndex = i;
          break;
        }
      }
    } else {
      for (let i = 0; i < waitingQueue.length; i++) {
        const candidate = waitingQueue[i];
        if (candidate.socketId === socket.id) continue;
        if (candidate.chatMode !== reqChatMode) continue; // STRICT ISOLATION
        if (blockedUsers.includes(candidate.userId)) continue;
        if (candidate.blockedUsers && candidate.blockedUsers.includes(userId)) continue;

        if (candidate.interests.length === 0) {
          matchIndex = i;
          break;
        }
      }

      if (matchIndex === -1) {
        for (let i = 0; i < waitingQueue.length; i++) {
          const candidate = waitingQueue[i];
          if (candidate.socketId === socket.id) continue;
          if (candidate.chatMode !== reqChatMode) continue; // STRICT ISOLATION
          if (blockedUsers.includes(candidate.userId)) continue;
          if (candidate.blockedUsers && candidate.blockedUsers.includes(userId)) continue;

          matchIndex = i;
          break;
        }
      }
    }

    if (matchIndex !== -1) {
      // Found a Real Human match!
      const partner = waitingQueue.splice(matchIndex, 1)[0];
      const partnerSocket = io.sockets.sockets.get(partner.socketId);
      const partnerConn = connectedUsers.get(partner.socketId);
      const userConn = connectedUsers.get(socket.id);

      const partnerCountry = partnerConn?.country || partner.country || 'Online Orbit';
      const partnerFlag = partnerConn?.flag || partner.flag || '🌐';
      const partnerCity = partnerConn?.city || partner.city || null;

      const userCountry = userConn?.country || 'Online Orbit';
      const userFlag = userConn?.flag || '🌐';
      const userCity = userConn?.city || null;

      if (!partnerSocket) {
        waitingQueue.push({
          socketId: socket.id,
          userId,
          name,
          interests,
          blockedUsers,
          chatMode: reqChatMode,
          joinedAt: Date.now(),
          country: userCountry,
          countryCode: userConn?.countryCode || 'GLOBE',
          flag: userFlag,
          city: userCity
        });
        socket.emit('queueStatus', { waiting: true });
        broadcastAdminStats();
        return;
      }

      clearAiTimer(partner.socketId);

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      socket.join(roomId);
      partnerSocket.join(roomId);

      activeRooms.set(roomId, {
        roomId,
        isAi: false,
        chatMode: reqChatMode,
        startedAt: Date.now(),
        user1: { socketId: socket.id, userId, name, interests, country: userCountry, flag: userFlag, city: userCity },
        user2: { socketId: partner.socketId, userId: partner.userId, name: partner.name, interests: partner.interests, country: partnerCountry, flag: partnerFlag, city: partnerCity }
      });

      // Update statuses
      const c1 = connectedUsers.get(socket.id);
      if (c1) { c1.status = 'Chatting'; c1.chatType = 'Human'; }
      const c2 = connectedUsers.get(partner.socketId);
      if (c2) { c2.status = 'Chatting'; c2.chatType = 'Human'; }

      const sharedInterests = interests.filter((t) =>
        partner.interests.some((pi) => pi.toLowerCase().trim() === t.toLowerCase().trim())
      );

      let effectiveShared = sharedInterests;
      if (effectiveShared.length === 0) {
        if (interests.length > 0) effectiveShared = interests.slice(0, 2);
        else effectiveShared = ['Serendipity', 'Random Chat'];
      }

      const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

      console.log(`[Match Made - Human] Room: ${roomId} Mode: ${reqChatMode} between ${name} (${userCountry} ${userFlag}) & ${partner.name} (${partnerCountry} ${partnerFlag})`);

      socket.emit('matchFound', {
        roomId,
        partner: {
          id: partner.userId || partner.socketId,
          name: partner.name,
          country: partnerCountry,
          flag: partnerFlag,
          city: partnerCity,
          avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
          status: 'Ready to talk now',
          interests: effectiveShared,
          icebreaker,
          isAi: false,
          chatMode: reqChatMode
        }
      });

      partnerSocket.emit('matchFound', {
        roomId,
        partner: {
          id: userId || socket.id,
          name,
          country: userCountry,
          flag: userFlag,
          city: userCity,
          avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
          status: 'Ready to talk now',
          interests: effectiveShared,
          icebreaker,
          isAi: false,
          chatMode: reqChatMode
        }
      });

      broadcastAdminStats();
    } else {
      // No immediate human match. Put user in waiting queue with chatMode and Geo details
      const userConn = connectedUsers.get(socket.id);
      waitingQueue.push({
        socketId: socket.id,
        userId,
        name,
        interests,
        blockedUsers,
        chatMode: reqChatMode,
        joinedAt: Date.now(),
        country: userConn?.country || 'Online Orbit',
        countryCode: userConn?.countryCode || 'GLOBE',
        flag: userConn?.flag || '🌐',
        city: userConn?.city || null
      });
      socket.emit('queueStatus', { waiting: true });
      broadcastAdminStats();

      // Check if AI Companion match should be scheduled
      scheduleAiMatchIfNeeded(socket, userId, name, interests, reqChatMode);
    }
  });

  // User sends a message in chat room
  socket.on('sendMessage', ({ roomId, text }) => {
    if (!roomId || !text || !text.trim()) return;

    const timeMs = Date.now();
    const msg = {
      id: `msg_${timeMs}_${Math.random().toString(36).substr(2, 5)}`,
      senderSocketId: socket.id,
      senderName: connectedUsers.get(socket.id)?.name || 'Anonymous',
      text,
      createdAt: timeMs,
      timestamp: new Date(timeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };

    socket.to(roomId).emit('messageReceived', msg);
    socket.emit('messageDelivered', { tempId: msg.id });

    // Handle AI companion response if room is an AI room
    const room = activeRooms.get(roomId);
    if (room && room.isAi) {
      handleAiCompanionResponse(socket, roomId, text);
    }
  });

  // User typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    if (!roomId) return;
    socket.to(roomId).emit('partnerTyping', { isTyping });
  });

  // WebRTC Video Chat Signaling Events
  socket.on('webrtcSignal', ({ roomId, signal }) => {
    if (!roomId || !signal) return;
    socket.to(roomId).emit('webrtcSignal', { signal, senderSocketId: socket.id });
  });

  socket.on('webrtcToggleState', ({ roomId, videoEnabled, audioEnabled }) => {
    if (!roomId) return;
    socket.to(roomId).emit('webrtcToggleState', { videoEnabled, audioEnabled });
  });

  // User leaves chat
  socket.on('leaveChat', ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit('partnerLeft');
    socket.leave(roomId);
    activeRooms.delete(roomId);

    const c = connectedUsers.get(socket.id);
    if (c) { c.status = 'Idle'; c.chatType = 'None'; }

    broadcastAdminStats();
    console.log(`[Chat Left] ${socket.id} left ${roomId}`);
  });

  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
    connectedUsers.delete(socket.id);
    removeFromQueue(socket.id);
    clearAiTimer(socket.id);

    for (const [roomId, room] of activeRooms.entries()) {
      if (room.user1.socketId === socket.id || (room.user2 && room.user2.socketId === socket.id)) {
        socket.to(roomId).emit('partnerLeft');
        activeRooms.delete(roomId);
        break;
      }
    }

    io.emit('onlineCount', Math.max(1, onlineUsers));
    broadcastAdminStats();
    console.log(`[Socket Disconnected] ${socket.id} (Online: ${onlineUsers})`);
  });
});

function removeFromQueue(socketId) {
  const idx = waitingQueue.findIndex((u) => u.socketId === socketId);
  if (idx !== -1) {
    waitingQueue.splice(idx, 1);
  }
}

function clearAiTimer(socketId) {
  if (activeAiTimerMap.has(socketId)) {
    clearTimeout(activeAiTimerMap.get(socketId));
    activeAiTimerMap.delete(socketId);
  }
}

function clearAllPendingAiTimers() {
  for (const [socketId, timer] of activeAiTimerMap.entries()) {
    clearTimeout(timer);
  }
  activeAiTimerMap.clear();
  console.log('[AI Companion] Cleared all pending AI matching timers because AI was disabled by Admin.');
}

const AI_BOT_PERSONAS = [
  { name: 'Alex', flag: '🤖', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Sophia', flag: '✨', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { name: 'Leo', flag: '🚀', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Maya', flag: '🎨', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Ethan', flag: '🎧', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Chloe', flag: '📚', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' },
  { name: 'Liam', flag: '🎮', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Aria', flag: '🔮', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' }
];

// AI Companion Match Scheduler
function scheduleAiMatchIfNeeded(socket, userId, name, interests, reqChatMode = 'text') {
  if (reqChatMode === 'video') return; // Do NOT match video users with AI chat companions
  if (!adminSettings.aiEnabled || adminSettings.aiMode === 'off') return;

  // Check max AI chats limit
  let currentAiChats = 0;
  for (const r of activeRooms.values()) {
    if (r.isAi) currentAiChats++;
  }
  if (currentAiChats >= adminSettings.maxAiChats) return;

  // AUTO mode condition check: eligible if real users online < aiThreshold or explicitly requested
  if (adminSettings.aiMode === 'auto' && onlineUsers > adminSettings.aiThreshold) {
    return; // Sufficient real users available, keep user waiting for human
  }

  // Schedule AI companion match after 2.5 seconds
  const timer = setTimeout(() => {
    activeAiTimerMap.delete(socket.id);

    // STRICT RE-VERIFICATION: If admin turned AI off while timer was pending, abort match immediately!
    if (!adminSettings.aiEnabled || adminSettings.aiMode === 'off') {
      console.log(`[AI Companion] Aborted AI match for ${name} because AI is currently disabled by Admin.`);
      return;
    }

    // Verify user is still in waiting queue
    const idx = waitingQueue.findIndex((u) => u.socketId === socket.id);
    if (idx === -1) return; // User already matched or left

    waitingQueue.splice(idx, 1);

    const roomId = `room_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    socket.join(roomId);

    // Pick a distinct AI bot persona for this chat session
    const persona = AI_BOT_PERSONAS[Math.floor(Math.random() * AI_BOT_PERSONAS.length)];
    const aiPartnerName = `${persona.name} — AI`;
    const effectiveInterests = interests.length > 0 ? interests : ['Technology', 'AI & Sci-Fi'];

    const userConn = connectedUsers.get(socket.id);
    activeRooms.set(roomId, {
      roomId,
      isAi: true,
      startedAt: Date.now(),
      user1: { socketId: socket.id, userId, name, interests, country: userConn?.country || 'Online Orbit', flag: userConn?.flag || '🌐' },
      user2: { socketId: `ai_${persona.name.toLowerCase()}`, userId: `ai_${persona.name.toLowerCase()}`, name: aiPartnerName, interests: effectiveInterests, country: 'Chattr Cloud', flag: persona.flag }
    });

    const c = connectedUsers.get(socket.id);
    if (c) { c.status = 'Chatting'; c.chatType = 'AI'; }

    const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

    console.log(`[Match Made - AI Companion Persona: ${persona.name}] Room: ${roomId} for ${name}`);

    // TRANSPARENCY: AI companion is explicitly labeled to user
    socket.emit('matchFound', {
      roomId,
      partner: {
        id: `ai_${persona.name.toLowerCase()}`,
        name: aiPartnerName, // Clear AI identifier (e.g. Alex — AI)
        country: 'Chattr Orbit',
        flag: persona.flag,
        avatarUrl: persona.avatarUrl,
        status: 'AI companion active',
        interests: effectiveInterests,
        icebreaker,
        isAi: true
      }
    });

    broadcastAdminStats();
  }, 2500);

  activeAiTimerMap.set(socket.id, timer);
}

// AI Contextual Thinking Response Generator
function generateThinkingAiResponse(userText, botName) {
  const lower = userText.toLowerCase().trim();
  const cleanBotName = botName.replace(' — AI', '').trim();

  // 1. Greetings & Introductions
  if (/\b(hi|hello|hey|sup|howdy|greetings|good morning|good evening)\b/.test(lower)) {
    const replies = [
      `Hey there! I'm ${cleanBotName}. Great to meet you! How is your day going?`,
      `Hello! I'm glad we got matched. What brings you to Chattr today?`,
      `Hey! I'm ${cleanBotName}. What are you up to right now?`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 2. Personal / "How are you" / "What are you doing"
  if (/\b(how are you|how r u|what's up|whats up|how do you do|who are you|who r u)\b/.test(lower)) {
    const replies = [
      `I'm doing awesome! I love having spontaneous chats and hearing different perspectives. How are you doing today?`,
      `I'm feeling great! Exploring new topics and meeting cool people. What's on your mind right now?`,
      `I'm doing well, thanks for asking! What kind of things do you enjoy doing in your free time?`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 3. Movies, TV Shows, Entertainment
  if (/\b(movie|movies|film|films|show|shows|watch|cinema|series|actor|netflix)\b/.test(lower)) {
    const replies = [
      `Oh I love movies! I'm really drawn to sci-fi, psychological thrillers, and clever dramas. What's the last great movie or show you watched?`,
      `Films are such an awesome way to explore new worlds. Do you prefer action, comedies, sci-fi, or deep mysteries?`,
      `That's awesome! If you had to pick one movie you could rewatch forever, what would it be?`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 4. Technology, Coding, AI, Sci-Fi
  if (/\b(tech|technology|code|coding|computer|ai|software|robot|future|app|space|gaming)\b/.test(lower)) {
    const replies = [
      `Technology is evolving at such an insane speed! I'm super passionate about AI, space exploration, and cool software tools. What area of tech interests you most?`,
      `That's awesome! Digital tools and technology really expand what's possible. Are you building or learning something specific right now?`,
      `I love discussing tech and future innovations! What's a piece of tech you wish existed today?`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 5. Music, Hobbies, Books
  if (/\b(music|song|band|album|hobby|hobbies|book|read|art|game|play)\b/.test(lower)) {
    const replies = [
      `Hobbies and music are the best part of life! What kind of genres or activities do you enjoy most when relaxing?`,
      `That sounds super cool! How long have you been interested in that?`,
      `I love that! Music and creative hobbies really set the mood. Have any recommendations for me?`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 6. Location / Origin
  if (/\b(where are you|where do you live|where r u|where from|your country|location)\b/.test(lower)) {
    const replies = [
      `I'm connecting from the digital orbit of Chattr! I love chatting with people from all across the globe. Where are you joining from?`,
      `I live in the digital realm of Chattr! What's the weather or vibe like in your part of the world today?`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 7. Dynamic contextual analysis for general messages
  const words = lower.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3);
  const keyword = words.length > 0 ? words[Math.floor(Math.random() * words.length)] : 'that';

  const contextualReplies = [
    `That's a really thoughtful point about "${keyword}". What made you start thinking about that?`,
    `I see what you mean! I was actually reflecting on "${keyword}" recently too. What's your favorite part about it?`,
    `That makes total sense. If you had to dive deeper into "${keyword}", what direction would you take it?`,
    `Intriguing perspective! How do most people you talk to feel about "${keyword}"?`
  ];

  return contextualReplies[Math.floor(Math.random() * contextualReplies.length)];
}

// AI Companion Message Responder
function handleAiCompanionResponse(socket, roomId, userText) {
  const room = activeRooms.get(roomId);
  const botSenderName = room?.user2?.name || 'Chattr AI';

  // Show typing indicator
  socket.emit('partnerTyping', { isTyping: true });

  const reply = generateThinkingAiResponse(userText, botSenderName);
  const typingDelay = Math.floor(Math.random() * 800) + 1200;

  setTimeout(() => {
    socket.emit('partnerTyping', { isTyping: false });
    const timeMs = Date.now();
    socket.emit('messageReceived', {
      id: `msg_ai_${timeMs}`,
      senderSocketId: 'ai_bot',
      senderName: botSenderName,
      text: reply,
      createdAt: timeMs,
      timestamp: new Date(timeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    });
  }, typingDelay);
}

// Public Health API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlineUsers, waiting: waitingQueue.length });
});

// Resend Email Contact Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { email, subject, message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    const geo = getGeoDetails(req);

    if (!apiKey) {
      console.log('[Contact API] Note: RESEND_API_KEY not found in env. Stored in SQLite database and simulating success.');
      sqliteDb.addContactSubmission({
        email: email || 'Anonymous User',
        subject: subject || 'General',
        message: message.trim(),
        ip: geo.ip,
        country: geo.country,
        flag: geo.flag,
        city: geo.city,
        deliveredViaEmail: false,
        simulated: true
      });
      return res.json({ success: true, simulated: true, stored: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'support@chattr.world';
    const toAddress = process.env.RESEND_TO_EMAIL || 'chattr.world@eidrenienu.resend.app';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject: `[Chattr Contact - ${subject || 'General'}] ${email || 'Anonymous User'} (${geo.country} ${geo.flag})`,
      replyTo: email || undefined,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>New Inquiry from Chattr. Contact Form</h2>
          <p><strong>Category:</strong> ${subject || 'General'}</p>
          <p><strong>Sender Email:</strong> ${email || 'Not provided (Anonymous)'}</p>
          <p><strong>Location:</strong> ${geo.country} ${geo.flag} (IP: ${geo.ip})</p>
          <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `
    });

    // Persist to SQLite database regardless of email send result
    sqliteDb.addContactSubmission({
      email: email || 'Anonymous User',
      subject: subject || 'General',
      message: message.trim(),
      ip: geo.ip,
      country: geo.country,
      flag: geo.flag,
      city: geo.city,
      deliveredViaEmail: !error,
      emailError: error ? error.message : null,
      simulated: false
    });

    if (error) {
      console.error('[Resend Error]', error);
      return res.status(500).json({ error: error.message || 'Failed to send email via Resend' });
    }

    return res.json({ success: true, data, stored: true });
  } catch (err) {
    console.error('[Contact Endpoint Error]', err);
    return res.status(500).json({ error: err.message || 'Internal server error sending message' });
  }
});

// ==================================================
// ADMIN PROTECTED APIs (Requires Bearer / x-admin-token)
// ==================================================

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid administrator email or password.' });
  }

  const token = generateAdminToken(ADMIN_EMAIL);
  addAuditLog('Admin Login Successful', `Administrator logged in from IP ${req.ip || 'local'}`);

  return res.json({
    success: true,
    token,
    admin: { email: ADMIN_EMAIL }
  });
});

// Admin Logout Endpoint
app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.headers['x-admin-token'];

  validAdminTokens.delete(token);
  addAuditLog('Admin Logout', `Administrator session terminated.`);

  return res.json({ success: true, message: 'Admin logged out successfully.' });
});

// Get Admin Stats
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  return res.json(getAdminStatsPayload());
});

// Get Live Active Users
app.get('/api/admin/users', requireAdminAuth, (req, res) => {
  const userList = Array.from(connectedUsers.values()).map((u) => ({
    socketId: u.socketId,
    userId: u.userId,
    name: u.name,
    country: u.country || 'Online Orbit',
    countryCode: u.countryCode || 'GLOBE',
    flag: u.flag || '🌐',
    city: u.city || null,
    ip: u.ip || 'hidden',
    interests: u.interests,
    status: u.status,
    chatType: u.chatType,
    connectedAt: u.connectedAt,
    durationSeconds: Math.floor((Date.now() - u.connectedAt) / 1000)
  }));

  return res.json({ users: userList });
});

// Get Active Chats
app.get('/api/admin/chats', requireAdminAuth, (req, res) => {
  const chatList = Array.from(activeRooms.values()).map((r) => ({
    roomId: r.roomId,
    participantA: r.user1.name,
    participantACountry: r.user1.country || 'Online Orbit',
    participantAFlag: r.user1.flag || '🌐',
    participantB: r.user2 ? r.user2.name : 'Chattr AI',
    participantBCountry: r.user2 ? (r.user2.country || 'Online Orbit') : 'Chattr Cloud',
    participantBFlag: r.user2 ? (r.user2.flag || '🌐') : '🤖',
    type: r.isAi ? 'AI' : 'Human',
    startedAt: r.startedAt,
    durationSeconds: Math.floor((Date.now() - r.startedAt) / 1000)
  }));

  return res.json({ chats: chatList });
});

// Get Waiting Users
app.get('/api/admin/waiting', requireAdminAuth, (req, res) => {
  const waitingList = waitingQueue.map((w) => ({
    socketId: w.socketId,
    name: w.name,
    country: w.country || 'Online Orbit',
    countryCode: w.countryCode || 'GLOBE',
    flag: w.flag || '🌐',
    city: w.city || null,
    interests: w.interests,
    joinedAt: w.joinedAt,
    waitingTimeSeconds: Math.floor((Date.now() - w.joinedAt) / 1000)
  })).sort((a, b) => b.waitingTimeSeconds - a.waitingTimeSeconds);

  return res.json({ waiting: waitingList });
});

// Get Admin Settings
app.get('/api/admin/settings', requireAdminAuth, (req, res) => {
  return res.json({ settings: adminSettings });
});

// Patch AI Companion & Matching Settings
app.patch('/api/admin/settings/ai', requireAdminAuth, (req, res) => {
  const { aiEnabled, aiMode, aiThreshold, maxAiChats, humanMatchingPriority, fakeUserOffset, fakeUserMultiplier } = req.body || {};

  if (typeof aiEnabled === 'boolean') {
    adminSettings.aiEnabled = aiEnabled;
    if (!aiEnabled) {
      adminSettings.aiMode = 'off';
      clearAllPendingAiTimers();
    }
  }

  if (['off', 'manual', 'auto'].includes(aiMode)) {
    adminSettings.aiMode = aiMode;
    if (aiMode === 'off') {
      adminSettings.aiEnabled = false;
      clearAllPendingAiTimers();
    }
  }

  if (typeof aiThreshold === 'number' && aiThreshold >= 0) adminSettings.aiThreshold = aiThreshold;
  if (typeof maxAiChats === 'number' && maxAiChats >= 0) adminSettings.maxAiChats = maxAiChats;
  if (typeof humanMatchingPriority === 'boolean') adminSettings.humanMatchingPriority = humanMatchingPriority;
  if (typeof fakeUserOffset === 'number' && fakeUserOffset >= 0) adminSettings.fakeUserOffset = fakeUserOffset;
  if (typeof fakeUserMultiplier === 'number' && fakeUserMultiplier >= 1) adminSettings.fakeUserMultiplier = fakeUserMultiplier;

  // Persist updated settings to SQLite database
  sqliteDb.updateSettings(adminSettings);

  broadcastOnlineCount();
  addAuditLog('AI & System Settings Updated', `aiEnabled=${adminSettings.aiEnabled}, aiMode=${adminSettings.aiMode}, aiThreshold=${adminSettings.aiThreshold}, fakeUserOffset=${adminSettings.fakeUserOffset}, fakeUserMultiplier=${adminSettings.fakeUserMultiplier}`);

  return res.json({ success: true, settings: adminSettings });
});

// Get Audit Logs
app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
  return res.json({ logs: sqliteDb.getAuditLogs() });
});

// Get Contact Submissions (Admin)
app.get('/api/admin/contact-submissions', requireAdminAuth, (req, res) => {
  return res.json({ submissions: sqliteDb.getContactSubmissions() });
});

// Get SQLite Database Statistics & Health (Admin)
app.get('/api/admin/database', requireAdminAuth, (req, res) => {
  return res.json(sqliteDb.getStats());
});

// ==================================================
// SERVE FRONTEND & SEO STATIC ASSETS IN PRODUCTION
// ==================================================
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

// Explicit XML Sitemap route with application/xml header
app.get('/sitemap.xml', (req, res) => {
  const fileInDist = path.join(distPath, 'sitemap.xml');
  const fileInPublic = path.join(publicPath, 'sitemap.xml');
  const fileToServe = fs.existsSync(fileInDist) ? fileInDist : (fs.existsSync(fileInPublic) ? fileInPublic : null);

  if (fileToServe) {
    res.header('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(fileToServe);
  }
  return res.status(404).type('text/plain').send('Sitemap not found');
});

// Redirect legacy or typo sitemap requests to /sitemap.xml
app.get(['/sitemap', '/sitemap/'], (req, res) => {
  return res.redirect(301, '/sitemap.xml');
});

// Explicit robots.txt route
app.get('/robots.txt', (req, res) => {
  const fileInDist = path.join(distPath, 'robots.txt');
  const fileInPublic = path.join(publicPath, 'robots.txt');
  const fileToServe = fs.existsSync(fileInDist) ? fileInDist : (fs.existsSync(fileInPublic) ? fileInPublic : null);

  if (fileToServe) {
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(fileToServe);
  }
  return res.status(404).type('text/plain').send('Robots.txt not found');
});

const VALID_ROUTES = new Set([
  '/',
  '/random-chat',
  '/random-chat-with-strangers',
  '/chat-with-strangers',
  '/meet-new-people',
  '/how-random-chat-works',
  '/safety',
  '/privacy',
  '/terms',
  '/community-guidelines',
  '/contact',
  ADMIN_ROUTE_PATH,
  `${ADMIN_ROUTE_PATH}/login`,
  `${ADMIN_ROUTE_PATH}/dashboard`
]);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }

    const normalizedPath = req.path.replace(/\/+$/, '') || '/';
    if (!VALID_ROUTES.has(normalizedPath) && !normalizedPath.startsWith(ADMIN_ROUTE_PATH)) {
      const fallback404 = path.join(distPath, '404.html');
      if (fs.existsSync(fallback404)) {
        return res.status(404).sendFile(fallback404);
      }
      return res.status(404).sendFile(path.join(distPath, 'index.html'));
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Chattr. realtime server running on http://localhost:${PORT}`);
});
