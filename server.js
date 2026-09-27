import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

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

// Admin Authentication Config
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

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

// Admin Controlled Settings (Source of Truth)
const adminSettings = {
  aiEnabled: true,
  aiMode: 'auto', // 'off' | 'manual' | 'auto'
  aiThreshold: 20, // Min real users threshold to activate AI matching
  maxAiChats: 10,
  humanMatchingPriority: true
};

// Admin Audit Logs Store
const auditLogs = [
  {
    id: 'log-1',
    timestamp: new Date().toISOString(),
    admin: ADMIN_EMAIL,
    action: 'System Initialized',
    details: 'Admin Dashboard server & monitoring service started.'
  }
];

function addAuditLog(action, details) {
  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    admin: ADMIN_EMAIL,
    action,
    details
  };
  auditLogs.unshift(entry);
  if (auditLogs.length > 100) auditLogs.pop();
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
    activeChats: activeRooms.size,
    waitingUsers: waitingQueue.length,
    aiChats: aiChatsCount,
    serverStatus: {
      socketIo: 'Online',
      matchingService: 'Running',
      aiService: adminSettings.aiEnabled ? 'Running' : 'Disabled',
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.floor(process.uptime()),
      connections: onlineUsers
    },
    settings: adminSettings
  };
}

function broadcastAdminStats() {
  adminNamespace.emit('admin:stats', getAdminStatsPayload());
}

// User Sockets Connection
io.on('connection', (socket) => {
  onlineUsers++;
  connectedUsers.set(socket.id, {
    socketId: socket.id,
    userId: `user_${socket.id.substring(0, 6)}`,
    name: 'Anonymous Stranger',
    interests: [],
    status: 'Idle',
    chatType: 'None',
    connectedAt: Date.now()
  });

  io.emit('onlineCount', Math.max(1, onlineUsers));
  broadcastAdminStats();

  console.log(`[Socket Connected] ${socket.id} (Online: ${onlineUsers})`);

  socket.on('getOnlineCount', () => {
    socket.emit('onlineCount', Math.max(1, onlineUsers));
  });

  // User requests to find a match
  socket.on('findMatch', (userData) => {
    const { userId, name, interests = [], blockedUsers = [] } = userData;

    // Update connection metadata
    const conn = connectedUsers.get(socket.id);
    if (conn) {
      conn.userId = userId || conn.userId;
      conn.name = name || conn.name;
      conn.interests = interests;
      conn.status = 'Matching';
    }

    // Remove any existing entry for this socket from the queue
    removeFromQueue(socket.id);
    clearAiTimer(socket.id);

    const userInterestsLower = interests.map((t) => t.toLowerCase().trim());
    const hasUserInterests = userInterestsLower.length > 0;

    // 1. Look for compatible REAL HUMAN match in queue FIRST (Human priority)
    let matchIndex = -1;

    if (hasUserInterests) {
      for (let i = 0; i < waitingQueue.length; i++) {
        const candidate = waitingQueue[i];
        if (candidate.socketId === socket.id) continue;
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

      if (!partnerSocket) {
        waitingQueue.push({ socketId: socket.id, userId, name, interests, blockedUsers, joinedAt: Date.now() });
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
        startedAt: Date.now(),
        user1: { socketId: socket.id, userId, name, interests },
        user2: { socketId: partner.socketId, userId: partner.userId, name: partner.name, interests: partner.interests }
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

      console.log(`[Match Made - Human] Room: ${roomId} between ${name} & ${partner.name}`);

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
          icebreaker,
          isAi: false
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
          icebreaker,
          isAi: false
        }
      });

      broadcastAdminStats();
    } else {
      // No immediate human match. Put user in waiting queue
      waitingQueue.push({ socketId: socket.id, userId, name, interests, blockedUsers, joinedAt: Date.now() });
      socket.emit('queueStatus', { waiting: true });
      broadcastAdminStats();

      // Check if AI Companion match should be scheduled
      scheduleAiMatchIfNeeded(socket, userId, name, interests);
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

// AI Companion Match Scheduler
function scheduleAiMatchIfNeeded(socket, userId, name, interests) {
  if (!adminSettings.aiEnabled) return;
  if (adminSettings.aiMode === 'off') return;

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

  // Schedule AI companion match after 2 seconds
  const timer = setTimeout(() => {
    activeAiTimerMap.delete(socket.id);

    // Verify user is still in waiting queue
    const idx = waitingQueue.findIndex((u) => u.socketId === socket.id);
    if (idx === -1) return; // User already matched or left

    waitingQueue.splice(idx, 1);

    const roomId = `room_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    socket.join(roomId);

    const aiPartnerName = 'Chattr AI';
    const effectiveInterests = interests.length > 0 ? interests : ['Technology', 'AI & Sci-Fi'];

    activeRooms.set(roomId, {
      roomId,
      isAi: true,
      startedAt: Date.now(),
      user1: { socketId: socket.id, userId, name, interests },
      user2: { socketId: 'ai_bot', userId: 'ai_bot', name: aiPartnerName, interests: effectiveInterests }
    });

    const c = connectedUsers.get(socket.id);
    if (c) { c.status = 'Chatting'; c.chatType = 'AI'; }

    const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];

    console.log(`[Match Made - AI Companion] Room: ${roomId} for ${name}`);

    // TRANSPARENCY: AI companion is explicitly labeled to user
    socket.emit('matchFound', {
      roomId,
      partner: {
        id: 'ai_bot',
        name: `${aiPartnerName} — AI`, // Clear AI identifier
        country: 'Chattr Orbit',
        flag: '🤖',
        avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
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

// AI Companion Message Responder
function handleAiCompanionResponse(socket, roomId, userText) {
  // Show typing indicator
  socket.emit('partnerTyping', { isTyping: true });

  const aiResponses = [
    `That's fascinating! Tell me more about your thoughts on ${userText.split(' ').slice(0, 3).join(' ')}...`,
    `I love exploring topics like that. What inspired you to bring that up?`,
    `Interesting perspective! As an AI companion on Chattr, I enjoy discussing new ideas. What else are you curious about today?`,
    `Great point! How long have you been interested in this topic?`,
    `That sounds intriguing! Do you usually find people with similar passions when chatting online?`
  ];

  const reply = aiResponses[Math.floor(Math.random() * aiResponses.length)];

  setTimeout(() => {
    socket.emit('partnerTyping', { isTyping: false });
    const timeMs = Date.now();
    socket.emit('messageReceived', {
      id: `msg_ai_${timeMs}`,
      senderSocketId: 'ai_bot',
      senderName: 'Chattr AI',
      text: reply,
      createdAt: timeMs,
      timestamp: new Date(timeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    });
  }, 1200);
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
    if (!apiKey) {
      console.log('[Contact API] Note: RESEND_API_KEY not found in env. Simulating success.');
      return res.json({ success: true, simulated: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const toAddress = process.env.RESEND_TO_EMAIL || 'aswanth.a.m.athira@gmail.com';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject: `[Chattr Contact - ${subject || 'General'}] ${email || 'Anonymous User'}`,
      replyTo: email || undefined,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>New Inquiry from Chattr. Contact Form</h2>
          <p><strong>Category:</strong> ${subject || 'General'}</p>
          <p><strong>Sender Email:</strong> ${email || 'Not provided (Anonymous)'}</p>
          <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `
    });

    if (error) {
      console.error('[Resend Error]', error);
      return res.status(500).json({ error: error.message || 'Failed to send email via Resend' });
    }

    return res.json({ success: true, data });
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
    participantB: r.user2 ? r.user2.name : 'Chattr AI',
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
  const { aiEnabled, aiMode, aiThreshold, maxAiChats, humanMatchingPriority } = req.body || {};

  if (typeof aiEnabled === 'boolean') adminSettings.aiEnabled = aiEnabled;
  if (['off', 'manual', 'auto'].includes(aiMode)) adminSettings.aiMode = aiMode;
  if (typeof aiThreshold === 'number' && aiThreshold >= 0) adminSettings.aiThreshold = aiThreshold;
  if (typeof maxAiChats === 'number' && maxAiChats >= 0) adminSettings.maxAiChats = maxAiChats;
  if (typeof humanMatchingPriority === 'boolean') adminSettings.humanMatchingPriority = humanMatchingPriority;

  addAuditLog('AI Settings Updated', `aiEnabled=${adminSettings.aiEnabled}, aiMode=${adminSettings.aiMode}, aiThreshold=${adminSettings.aiThreshold}, maxAiChats=${adminSettings.maxAiChats}`);

  return res.json({ success: true, settings: adminSettings });
});

// Get Audit Logs
app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
  return res.json({ logs: auditLogs });
});

// ==================================================
// SERVE FRONTEND IN PRODUCTION
// ==================================================
const distPath = path.join(__dirname, 'dist');
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
  '/admin',
  '/admin/login',
  '/admin/dashboard'
]);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }

    const normalizedPath = req.path.replace(/\/+$/, '') || '/';
    if (!VALID_ROUTES.has(normalizedPath) && !normalizedPath.startsWith('/admin')) {
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
