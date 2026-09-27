import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LiveUsers } from './LiveUsers';
import { ActiveChats } from './ActiveChats';
import { WaitingUsers } from './WaitingUsers';
import { AIControls } from './AIControls';
import { MatchingSettings } from './MatchingSettings';
import { SystemStatus } from './SystemStatus';
import { AuditLogs } from './AuditLogs';

interface AdminDashboardProps {
  token: string;
  adminEmail: string;
  onLogout: () => void;
}

type AdminTab =
  | 'overview'
  | 'users'
  | 'chats'
  | 'waiting'
  | 'ai'
  | 'matching'
  | 'system'
  | 'audit';

interface StatsPayload {
  realUsersOnline: number;
  activeChats: number;
  waitingUsers: number;
  aiChats: number;
  serverStatus: {
    socketIo: string;
    matchingService: string;
    aiService: string;
    memoryUsageMb: number;
    uptimeSeconds: number;
    connections: number;
  };
  settings: {
    aiEnabled: boolean;
    aiMode: 'off' | 'manual' | 'auto';
    aiThreshold: number;
    maxAiChats: number;
    humanMatchingPriority: boolean;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminEmail,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<StatsPayload>({
    realUsersOnline: 0,
    activeChats: 0,
    waitingUsers: 0,
    aiChats: 0,
    serverStatus: {
      socketIo: 'Connecting...',
      matchingService: 'Running',
      aiService: 'Running',
      memoryUsageMb: 0,
      uptimeSeconds: 0,
      connections: 0
    },
    settings: {
      aiEnabled: true,
      aiMode: 'auto',
      aiThreshold: 20,
      maxAiChats: 10,
      humanMatchingPriority: true
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connect to protected Socket.IO /admin namespace for live statistics
  useEffect(() => {
    let socket: Socket | null = null;

    try {
      socket = io('/admin', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socket.on('admin:stats', (payload: StatsPayload) => {
        setStats(payload);
      });

      socket.on('connect', () => {
        socket?.emit('requestStats');
      });
    } catch (err) {
      console.error('[Admin Socket Connection Error]', err);
    }

    // Fallback polling every 5s if socket disconnected
    const fetchStatsRest = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        // silent fallback
      }
    };

    fetchStatsRest();
    const pollInterval = setInterval(fetchStatsRest, 5000);

    return () => {
      clearInterval(pollInterval);
      if (socket) socket.disconnect();
    };
  }, [token]);

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // silent catch
    }
    onLogout();
  };

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-col font-sans selection:bg-[#e3dfff] selection:text-[#5146d0]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-subtle/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-container"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            <img
              src="/icons/chattr-icon-96x96.png"
              alt="Chattr. Logo"
              className="w-7 h-7 rounded-full shadow-sm object-cover shrink-0"
            />
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
              Chattr<span className="text-secondary">.</span> Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-state-success animate-pulse" />
              <span className="text-text-secondary font-medium">Server Online</span>
            </div>

            <div className="hidden lg:block font-caption text-caption text-text-muted">
              {adminEmail}
            </div>

            <button
              onClick={handleLogoutClick}
              className="h-9 px-4 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-subtle font-caption text-caption font-semibold text-text-primary flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar & Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside
          className={`w-full md:w-64 bg-surface/50 border-r border-border-subtle p-4 space-y-1 ${
            mobileMenuOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="px-3 py-2 text-label-sm font-semibold uppercase tracking-wider text-text-muted text-[11px]">
            Navigation
          </div>

          <button
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span>Live Users</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-container text-xs font-bold text-text-muted">
              {stats.realUsersOnline}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('chats'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Active Chats</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-container text-xs font-bold text-text-muted">
              {stats.activeChats}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('waiting'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'waiting'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            <span>Waiting Queue</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-container text-xs font-bold text-text-muted">
              {stats.waitingUsers}
            </span>
          </button>

          <div className="pt-4 px-3 py-2 text-label-sm font-semibold uppercase tracking-wider text-text-muted text-[11px]">
            Configuration
          </div>

          <button
            onClick={() => { setActiveTab('ai'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span>AI Companions</span>
            {stats.settings?.aiEnabled && (
              <span className="ml-auto w-2 h-2 rounded-full bg-state-success" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('matching'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span>Matching Settings</span>
          </button>

          <div className="pt-4 px-3 py-2 text-label-sm font-semibold uppercase tracking-wider text-text-muted text-[11px]">
            System & Logs
          </div>

          <button
            onClick={() => { setActiveTab('system'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'system'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dns</span>
            <span>System Status</span>
          </button>

          <button
            onClick={() => { setActiveTab('audit'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body-sm text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-secondary-fixed/50 text-text-primary font-semibold text-secondary'
                : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Audit Log</span>
          </button>
        </aside>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 space-y-8 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display-hero-mobile text-display-hero-mobile sm:text-headline-lg font-bold text-text-primary tracking-tight">
                  System Overview
                </h1>
                <p className="font-body-md text-body-md text-text-secondary mt-1">
                  Live real-time operational statistics for Chattr.
                </p>
              </div>

              {/* Prominent Live Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    <span>Real Users Online</span>
                    <span className="material-symbols-outlined text-[20px] text-primary">group</span>
                  </div>
                  <div className="font-display-hero-mobile text-[36px] font-bold text-text-primary">
                    {stats.realUsersOnline}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    <span>Active Chats</span>
                    <span className="material-symbols-outlined text-[20px] text-state-success">chat</span>
                  </div>
                  <div className="font-display-hero-mobile text-[36px] font-bold text-text-primary">
                    {stats.activeChats}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    <span>Waiting for Match</span>
                    <span className="material-symbols-outlined text-[20px] text-amber-500">hourglass_top</span>
                  </div>
                  <div className="font-display-hero-mobile text-[36px] font-bold text-text-primary">
                    {stats.waitingUsers}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    <span>AI Chats</span>
                    <span className="material-symbols-outlined text-[20px] text-secondary">smart_toy</span>
                  </div>
                  <div className="font-display-hero-mobile text-[36px] font-bold text-text-primary">
                    {stats.aiChats}
                  </div>
                </div>
              </div>

              {/* AI Controls Summary */}
              <AIControls token={token} />

              {/* Recent Audit Log Preview */}
              <AuditLogs token={token} />
            </div>
          )}

          {activeTab === 'users' && <LiveUsers token={token} />}
          {activeTab === 'chats' && <ActiveChats token={token} />}
          {activeTab === 'waiting' && <WaitingUsers token={token} />}
          {activeTab === 'ai' && <AIControls token={token} />}
          {activeTab === 'matching' && <MatchingSettings token={token} />}
          {activeTab === 'system' && <SystemStatus token={token} />}
          {activeTab === 'audit' && <AuditLogs token={token} />}
        </main>
      </div>
    </div>
  );
};
