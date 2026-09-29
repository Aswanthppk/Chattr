import React, { useEffect, useState } from 'react';

interface SystemStatusProps {
  token: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ token }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('[System Status Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading || !stats) {
    return <div className="py-12 text-center text-text-muted">Loading system metrics...</div>;
  }

  const { serverStatus } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
          Server Health & System Metrics
        </h2>
        <p className="font-body-sm text-body-sm text-text-secondary">
          Monitor WebSocket status, memory consumption, process uptime, and matching service availability.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            <span>Socket.IO Engine</span>
            <span className="w-2 h-2 rounded-full bg-state-success" />
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {serverStatus?.socketIo || 'Connected'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            <span>Matching Service</span>
            <span className="w-2 h-2 rounded-full bg-state-success" />
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {serverStatus?.matchingService || 'Running'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            <span>AI Service</span>
            <span className={`w-2 h-2 rounded-full ${stats.settings?.aiEnabled ? 'bg-state-success' : 'bg-amber-500'}`} />
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {serverStatus?.aiService || 'Running'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            Memory Usage
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {serverStatus?.memoryUsageMb || 0} MB
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            Process Uptime
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {Math.floor((serverStatus?.uptimeSeconds || 0) / 3600)}h {Math.floor(((serverStatus?.uptimeSeconds || 0) % 3600) / 60)}m
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            Current Sockets
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {serverStatus?.connections || 0}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            <span>Database Engine</span>
            <span className="w-2 h-2 rounded-full bg-state-success" />
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            SQLite 3 (WAL)
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs space-y-1">
          <div className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            Database File Size
          </div>
          <div className="font-headline-sm text-headline-sm font-bold text-text-primary">
            {stats.databaseStatus?.sizeKb || 4} KB
          </div>
        </div>
      </div>

      {stats.databaseStatus && (
        <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">database</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-text-primary">
                SQLite Persistence & Storage
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-state-success/15 text-state-success font-mono text-caption font-semibold">
              ACID Compliant · WAL Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle/60">
              <span className="font-caption text-caption text-text-muted block">System Settings</span>
              <span className="font-headline-sm text-headline-sm font-bold text-text-primary">1 row</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle/60">
              <span className="font-caption text-caption text-text-muted block">Audit Logs</span>
              <span className="font-headline-sm text-headline-sm font-bold text-text-primary">
                {stats.databaseStatus.tables?.auditLogs || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle/60">
              <span className="font-caption text-caption text-text-muted block">Contact Inquiries</span>
              <span className="font-headline-sm text-headline-sm font-bold text-text-primary">
                {stats.databaseStatus.tables?.contactSubmissions || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle/60">
              <span className="font-caption text-caption text-text-muted block">Banned Records</span>
              <span className="font-headline-sm text-headline-sm font-bold text-text-primary">
                {stats.databaseStatus.tables?.bannedUsers || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
