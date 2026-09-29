import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'chattr.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize SQLite Database with Write-Ahead Logging (WAL) for high concurrency & reliability
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// 1. System & Admin Settings Table
db.exec(`
  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    ai_enabled INTEGER NOT NULL DEFAULT 0,
    ai_mode TEXT NOT NULL DEFAULT 'off',
    ai_threshold INTEGER NOT NULL DEFAULT 20,
    max_ai_chats INTEGER NOT NULL DEFAULT 10,
    human_matching_priority INTEGER NOT NULL DEFAULT 1,
    fake_user_offset INTEGER NOT NULL DEFAULT 45,
    fake_user_multiplier REAL NOT NULL DEFAULT 1.5,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Audit Logs Table
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    admin TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
`);

// 3. Contact Submissions Table
db.exec(`
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    ip TEXT,
    country TEXT,
    country_code TEXT,
    flag TEXT,
    city TEXT,
    delivered_via_email INTEGER DEFAULT 0,
    email_error TEXT,
    simulated INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);
`);

// 4. Banned Users / IP Table
db.exec(`
  CREATE TABLE IF NOT EXISTS banned_users (
    id TEXT PRIMARY KEY,
    identifier TEXT UNIQUE NOT NULL,
    reason TEXT,
    banned_at TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_banned_identifier ON banned_users(identifier);
`);

// Seed default settings row if empty (or migrate from existing settings.json)
const seedSettings = () => {
  const existingRow = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
  if (!existingRow) {
    let defaults = {
      aiEnabled: 0,
      aiMode: 'off',
      aiThreshold: 20,
      maxAiChats: 10,
      humanMatchingPriority: 1,
      fakeUserOffset: 45,
      fakeUserMultiplier: 1.5
    };

    // Check if migration from settings.json is possible
    const jsonSettingsPath = path.join(DATA_DIR, 'settings.json');
    if (fs.existsSync(jsonSettingsPath)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(jsonSettingsPath, 'utf8'));
        if (fileContent) {
          defaults.aiEnabled = fileContent.aiEnabled ? 1 : 0;
          defaults.aiMode = fileContent.aiMode || 'off';
          defaults.aiThreshold = typeof fileContent.aiThreshold === 'number' ? fileContent.aiThreshold : 20;
          defaults.maxAiChats = typeof fileContent.maxAiChats === 'number' ? fileContent.maxAiChats : 10;
          defaults.humanMatchingPriority = fileContent.humanMatchingPriority !== false ? 1 : 0;
          defaults.fakeUserOffset = typeof fileContent.fakeUserOffset === 'number' ? fileContent.fakeUserOffset : 45;
          defaults.fakeUserMultiplier = typeof fileContent.fakeUserMultiplier === 'number' ? fileContent.fakeUserMultiplier : 1.5;
          console.log('[SQLite DB] Migrated existing settings from settings.json to SQLite database.');
        }
      } catch (e) {
        // Fall back to defaults
      }
    }

    db.prepare(`
      INSERT INTO system_settings (id, ai_enabled, ai_mode, ai_threshold, max_ai_chats, human_matching_priority, fake_user_offset, fake_user_multiplier)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      defaults.aiEnabled,
      defaults.aiMode,
      defaults.aiThreshold,
      defaults.maxAiChats,
      defaults.humanMatchingPriority,
      defaults.fakeUserOffset,
      defaults.fakeUserMultiplier
    );
  }
};

// Seed initial audit log if empty (or migrate from audit-logs.json)
const seedAuditLogs = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  if (count === 0) {
    const jsonLogsPath = path.join(DATA_DIR, 'audit-logs.json');
    if (fs.existsSync(jsonLogsPath)) {
      try {
        const logs = JSON.parse(fs.readFileSync(jsonLogsPath, 'utf8'));
        if (Array.isArray(logs) && logs.length > 0) {
          const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO audit_logs (id, timestamp, admin, action, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          const tx = db.transaction((items) => {
            for (const l of items) {
              insertStmt.run(
                l.id || `log-${Date.now()}`,
                l.timestamp || new Date().toISOString(),
                l.admin || 'System',
                l.action || 'Action',
                l.details || '',
                new Date(l.timestamp || Date.now()).getTime()
              );
            }
          });
          tx(logs);
          console.log(`[SQLite DB] Migrated ${logs.length} audit logs from audit-logs.json.`);
          return;
        }
      } catch (e) {}
    }

    // Default initialization log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, admin, action, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'log-init',
      new Date().toISOString(),
      'System',
      'System Initialized',
      'Chattr SQLite database engine initialized (WAL mode active).',
      Date.now()
    );
  }
};

// Migrate contact submissions if present
const seedContactSubmissions = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM contact_submissions').get().count;
  if (count === 0) {
    const jsonContactPath = path.join(DATA_DIR, 'contact-submissions.json');
    if (fs.existsSync(jsonContactPath)) {
      try {
        const subs = JSON.parse(fs.readFileSync(jsonContactPath, 'utf8'));
        if (Array.isArray(subs) && subs.length > 0) {
          const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO contact_submissions (
              id, timestamp, email, subject, message, ip, country, country_code, flag, city, delivered_via_email, email_error, simulated, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const tx = db.transaction((items) => {
            for (const s of items) {
              insertStmt.run(
                s.id || `contact-${Date.now()}`,
                s.timestamp || new Date().toISOString(),
                s.email || 'Anonymous',
                s.subject || 'General',
                s.message || '',
                s.ip || 'local',
                s.country || 'Online Orbit',
                s.countryCode || 'GLOBE',
                s.flag || '🌐',
                s.city || null,
                s.deliveredViaEmail ? 1 : 0,
                s.emailError || null,
                s.simulated ? 1 : 0,
                new Date(s.timestamp || Date.now()).getTime()
              );
            }
          });
          tx(subs);
          console.log(`[SQLite DB] Migrated ${subs.length} contact submissions from contact-submissions.json.`);
        }
      } catch (e) {}
    }
  }
};

// Run seeders
seedSettings();
seedAuditLogs();
seedContactSubmissions();

console.log('[SQLite DB] Successfully connected to SQLite database at:', DB_PATH);

// Helper: Convert SQLite row to camelCase settings object
function rowToSettings(row) {
  if (!row) return null;
  return {
    aiEnabled: Boolean(row.ai_enabled),
    aiMode: row.ai_mode,
    aiThreshold: row.ai_threshold,
    maxAiChats: row.max_ai_chats,
    humanMatchingPriority: Boolean(row.human_matching_priority),
    fakeUserOffset: row.fake_user_offset,
    fakeUserMultiplier: row.fake_user_multiplier,
    updatedAt: row.updated_at
  };
}

class SqliteDatabase {
  constructor() {
    this.db = db;
  }

  // --- SETTINGS OPERATIONS ---
  getSettings() {
    const row = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    return rowToSettings(row);
  }

  updateSettings(updates = {}) {
    const current = this.getSettings();
    const merged = { ...current, ...updates };

    db.prepare(`
      UPDATE system_settings
      SET ai_enabled = ?,
          ai_mode = ?,
          ai_threshold = ?,
          max_ai_chats = ?,
          human_matching_priority = ?,
          fake_user_offset = ?,
          fake_user_multiplier = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      merged.aiEnabled ? 1 : 0,
      merged.aiMode,
      merged.aiThreshold,
      merged.maxAiChats,
      merged.humanMatchingPriority ? 1 : 0,
      merged.fakeUserOffset,
      merged.fakeUserMultiplier
    );

    return this.getSettings();
  }

  // --- AUDIT LOGS OPERATIONS ---
  getAuditLogs(limit = 100) {
    const rows = db.prepare(`
      SELECT id, timestamp, admin, action, details
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
    return rows;
  }

  addAuditLog(entry) {
    const logId = entry.id || `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = entry.timestamp || new Date().toISOString();
    const createdAt = new Date(timestamp).getTime() || Date.now();

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, admin, action, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      timestamp,
      entry.admin || 'Admin',
      entry.action || 'Action',
      entry.details || '',
      createdAt
    );

    // Keep log table pruned to recent 500 records
    db.prepare(`
      DELETE FROM audit_logs
      WHERE id NOT IN (
        SELECT id FROM audit_logs ORDER BY created_at DESC LIMIT 500
      )
    `).run();

    return { id: logId, timestamp, ...entry };
  }

  // --- CONTACT SUBMISSIONS OPERATIONS ---
  getContactSubmissions(limit = 100) {
    const rows = db.prepare(`
      SELECT id, timestamp, email, subject, message, ip, country, country_code as countryCode, flag, city,
             delivered_via_email as deliveredViaEmail, email_error as emailError, simulated
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);

    return rows.map((r) => ({
      ...r,
      deliveredViaEmail: Boolean(r.deliveredViaEmail),
      simulated: Boolean(r.simulated)
    }));
  }

  addContactSubmission(submission) {
    const id = submission.id || `contact-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = submission.timestamp || new Date().toISOString();
    const createdAt = new Date(timestamp).getTime() || Date.now();

    db.prepare(`
      INSERT INTO contact_submissions (
        id, timestamp, email, subject, message, ip, country, country_code, flag, city, delivered_via_email, email_error, simulated, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      timestamp,
      submission.email || 'Anonymous User',
      submission.subject || 'General',
      submission.message || '',
      submission.ip || 'unknown',
      submission.country || 'Online Orbit',
      submission.countryCode || 'GLOBE',
      submission.flag || '🌐',
      submission.city || null,
      submission.deliveredViaEmail ? 1 : 0,
      submission.emailError || null,
      submission.simulated ? 1 : 0,
      createdAt
    );

    return { id, timestamp, ...submission };
  }

  // --- BANNED USERS / IP OPERATIONS ---
  getBannedUsers() {
    return db.prepare('SELECT id, identifier, reason, banned_at as bannedAt FROM banned_users ORDER BY created_at DESC').all();
  }

  isBanned(identifier) {
    if (!identifier) return false;
    const row = db.prepare('SELECT id FROM banned_users WHERE identifier = ?').get(identifier);
    return Boolean(row);
  }

  banUser(identifier, reason = 'Violation of community standards') {
    if (!identifier || this.isBanned(identifier)) return;
    const id = `ban-${Date.now()}`;
    const bannedAt = new Date().toISOString();
    db.prepare(`
      INSERT OR REPLACE INTO banned_users (id, identifier, reason, banned_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, identifier, reason, bannedAt, Date.now());

    return { id, identifier, reason, bannedAt };
  }

  unbanUser(identifier) {
    if (!identifier) return;
    db.prepare('DELETE FROM banned_users WHERE identifier = ?').run(identifier);
  }

  // --- DATABASE HEALTH & STATS ---
  getStats() {
    let dbSizeBytes = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        dbSizeBytes = fs.statSync(DB_PATH).size;
      }
    } catch (e) {}

    const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
    const contactCount = db.prepare('SELECT COUNT(*) as count FROM contact_submissions').get().count;
    const bannedCount = db.prepare('SELECT COUNT(*) as count FROM banned_users').get().count;

    return {
      engine: 'SQLite 3 (better-sqlite3)',
      file: DB_PATH,
      sizeBytes: dbSizeBytes,
      sizeKb: Math.round(dbSizeBytes / 1024),
      journalMode: 'WAL',
      tables: {
        systemSettings: 1,
        auditLogs: auditCount,
        contactSubmissions: contactCount,
        bannedUsers: bannedCount
      }
    };
  }
}

export const sqliteDb = new SqliteDatabase();
export default sqliteDb;
