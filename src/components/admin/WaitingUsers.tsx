import React, { useEffect, useState } from 'react';

interface WaitingItem {
  socketId: string;
  name: string;
  country?: string;
  countryCode?: string;
  flag?: string;
  city?: string;
  interests: string[];
  joinedAt: number;
  waitingTimeSeconds: number;
}

interface WaitingUsersProps {
  token: string;
}

export const WaitingUsers: React.FC<WaitingUsersProps> = ({ token }) => {
  const [waiting, setWaiting] = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWaiting = async () => {
    try {
      const res = await fetch('/api/admin/waiting', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.waiting) {
        setWaiting(data.waiting);
      }
    } catch (err) {
      console.error('[Waiting Users Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiting();
    const interval = setInterval(fetchWaiting, 3000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
            Waiting Queue ({waiting.length})
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Users currently waiting in queue sorted by longest wait duration.
          </p>
        </div>
        <button
          onClick={fetchWaiting}
          className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-subtle text-caption text-caption font-semibold text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-muted">Loading waiting queue...</div>
      ) : waiting.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-border-subtle space-y-2">
          <span className="material-symbols-outlined text-[36px] text-text-muted">hourglass_empty</span>
          <p className="font-body-md text-body-md font-semibold text-text-primary">No users are currently waiting.</p>
          <p className="font-caption text-caption text-text-secondary">Users searching for a match will appear here in real time.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low border-b border-border-subtle text-text-muted font-label-sm uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Display Name</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Selected Interests</th>
                  <th className="py-3 px-4">Waiting Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 text-text-primary">
                {waiting.map((w) => (
                  <tr key={w.socketId} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {w.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-xs text-text-secondary font-medium">
                        <span>{w.flag || '🌐'}</span>
                        <span>{w.country || 'Online Orbit'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {w.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {w.interests.map((i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-surface-container text-xs text-text-secondary">
                              {i}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-xs">Random (Any Interest)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      {w.waitingTimeSeconds}s
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
