import React, { useEffect, useState } from 'react';

interface ChatItem {
  roomId: string;
  participantA: string;
  participantACountry?: string;
  participantAFlag?: string;
  participantB: string;
  participantBCountry?: string;
  participantBFlag?: string;
  type: string; // 'Human' | 'AI'
  startedAt: number;
  durationSeconds: number;
}

interface ActiveChatsProps {
  token: string;
}

export const ActiveChats: React.FC<ActiveChatsProps> = ({ token }) => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/admin/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.chats) {
        setChats(data.chats);
      }
    } catch (err) {
      console.error('[Active Chats Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
            Active Chat Sessions ({chats.length})
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Live active rooms in session. Transcripts are ephemeral and never logged.
          </p>
        </div>
        <button
          onClick={fetchChats}
          className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-subtle text-caption text-caption font-semibold text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-muted">Loading active chat sessions...</div>
      ) : chats.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center border border-border-subtle space-y-2">
          <span className="material-symbols-outlined text-[36px] text-text-muted">forum</span>
          <p className="font-body-md text-body-md font-semibold text-text-primary">No active conversations.</p>
          <p className="font-caption text-caption text-text-secondary">Active match pairs will appear here in real time.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low border-b border-border-subtle text-text-muted font-label-sm uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Chat ID</th>
                  <th className="py-3 px-4">Participant A</th>
                  <th className="py-3 px-4">Participant B</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 text-text-primary">
                {chats.map((c) => (
                  <tr key={c.roomId} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-caption text-text-muted">
                      #{c.roomId.substring(0, 12)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      <div className="flex items-center gap-1.5" title={c.participantACountry || 'Online Orbit'}>
                        <span className="text-base">{c.participantAFlag || '🌐'}</span>
                        <span>{c.participantA}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      <div className="flex items-center gap-1.5" title={c.participantBCountry || 'Online Orbit'}>
                        <span className="text-base">{c.participantBFlag || (c.type === 'AI' ? '🤖' : '🌐')}</span>
                        <span>{c.participantB}</span>
                        {c.type === 'AI' && (
                          <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-bold">
                            AI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.type === 'AI'
                          ? 'bg-secondary/15 text-secondary border border-secondary/20'
                          : 'bg-state-success/15 text-state-success'
                      }`}>
                        {c.type === 'AI' ? 'AI Companion' : 'Human ↔ Human'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                      {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s
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
