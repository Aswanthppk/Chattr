import React, { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@chattr.world');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid admin credentials');
      }

      onLoginSuccess(data.token, data.admin?.email || email);
    } catch (err: any) {
      console.error('[Admin Login Error]', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex items-center justify-center p-6 selection:bg-[#e3dfff] selection:text-[#5146d0]">
      <div className="w-full max-w-md bg-surface rounded-2xl p-8 border border-border-subtle shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant mx-auto flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">shield_person</span>
          </div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-text-primary">
            Chattr. Admin Control Panel
          </h1>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Restricted access for system administrator only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-body-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="adminEmail" className="font-label-sm text-label-sm font-semibold text-text-primary">
              Administrator Email
            </label>
            <input
              id="adminEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chattr.world"
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/40 font-body-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="adminPassword" className="font-label-sm text-label-sm font-semibold text-text-primary">
              Password
            </label>
            <input
              id="adminPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/40 font-body-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-border-subtle/60 text-caption text-caption text-text-muted">
          <span>Protected by server-side authorization token</span>
        </div>
      </div>
    </div>
  );
};
