import React, { useEffect, useState } from 'react';

interface AuditItem {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  details: string;
}

interface AuditLogsProps {
  token: string;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ token }) => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('[Audit Logs Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
            Administrative Audit Log
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Recorded administrative configuration changes and security events. Message content is strictly never logged.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-subtle text-caption text-caption font-semibold text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-muted">Loading administrative audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-border-subtle text-text-muted">
          No administrative events recorded yet.
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low border-b border-border-subtle text-text-muted font-label-sm uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 text-text-primary">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-text-muted whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {l.admin}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-secondary">
                      {l.action}
                    </td>
                    <td className="py-3.5 px-4 font-caption text-caption text-text-secondary">
                      {l.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
