import React, { useEffect, useState } from 'react';

interface UserItem {
  socketId: string;
  userId: string;
  name: string;
  country?: string;
  countryCode?: string;
  flag?: string;
  city?: string;
  ip?: string;
  interests: string[];
  status: string;
  chatType: string;
  connectedAt: number;
  durationSeconds: number;
}

interface LiveUsersProps {
  token: string;
}

export const LiveUsers: React.FC<LiveUsersProps> = ({ token }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('[Live Users Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
            Active Connected Sockets ({users.length})
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Operational snapshot of connected clients with GeoIP geolocation details.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-subtle text-caption text-caption font-semibold text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-muted">Loading live user connections...</div>
      ) : users.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-border-subtle space-y-2">
          <span className="material-symbols-outlined text-[36px] text-text-muted">person_off</span>
          <p className="font-body-md text-body-md font-semibold text-text-primary">No real users online.</p>
          <p className="font-caption text-caption text-text-secondary">Connected clients will appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low border-b border-border-subtle text-text-muted font-label-sm uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Connection ID</th>
                  <th className="py-3 px-4">Display Name</th>
                  <th className="py-3 px-4">Country & IP</th>
                  <th className="py-3 px-4">Interests</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Chat Type</th>
                  <th className="py-3 px-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 text-text-primary">
                {users.map((u) => (
                  <tr key={u.socketId} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-caption text-text-muted">
                      {u.socketId.substring(0, 10)}...
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base shrink-0">{u.flag || '🌐'}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-xs text-text-primary truncate">
                            {u.city && u.city !== 'Local' ? `${u.city}, ` : ''}{u.country || 'Online Orbit'}
                          </span>
                          {u.ip && u.ip !== 'hidden' && (
                            <span className="font-mono text-[10px] text-text-muted">
                              {u.ip}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.interests.map((i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-surface-container text-xs text-text-secondary">
                              {i}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-xs">Any Interest</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.status === 'Chatting'
                          ? 'bg-state-success/15 text-state-success'
                          : u.status === 'Matching'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-surface-container text-text-secondary'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        u.chatType === 'AI'
                          ? 'bg-secondary/15 text-secondary border border-secondary/20'
                          : u.chatType === 'Human'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'text-text-muted'
                      }`}>
                        {u.chatType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                      {Math.floor(u.durationSeconds / 60)}m {u.durationSeconds % 60}s
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
