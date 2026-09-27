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
      </div>
    </div>
  );
};
