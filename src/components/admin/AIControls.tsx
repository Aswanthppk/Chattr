import React, { useEffect, useState } from 'react';

interface SettingsState {
  aiEnabled: boolean;
  aiMode: 'off' | 'manual' | 'auto';
  aiThreshold: number;
  maxAiChats: number;
  humanMatchingPriority: boolean;
  fakeUserOffset: number;
  fakeUserMultiplier: number;
}

interface AIControlsProps {
  token: string;
  onSettingsUpdated?: () => void;
}

export const AIControls: React.FC<AIControlsProps> = ({ token, onSettingsUpdated }) => {
  const [settings, setSettings] = useState<SettingsState>({
    aiEnabled: true,
    aiMode: 'auto',
    aiThreshold: 20,
    maxAiChats: 10,
    humanMatchingPriority: true,
    fakeUserOffset: 45,
    fakeUserMultiplier: 1.5
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error('[Settings Fetch Error]', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const updateSettings = async (newPartial: Partial<SettingsState>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings/ai', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPartial)
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update settings.');
      }

      setSuccessMsg('Settings updated successfully.');
      if (onSettingsUpdated) onSettingsUpdated();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('[Settings Patch Error]', err);
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
          AI Companion & Online Count Controls
        </h2>
        <p className="font-body-sm text-body-sm text-text-secondary">
          Configure AI companion participation rules and customize public online user count display parameters.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-body-sm font-medium">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-body-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main AI Toggle Card */}
      <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm font-bold text-text-primary">
                AI COMPANIONS
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                settings.aiEnabled
                  ? 'bg-state-success/15 text-state-success'
                  : 'bg-surface-container text-text-muted'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {settings.aiEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Allow AI companions to participate when configured matching conditions are met.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => updateSettings({ aiEnabled: !settings.aiEnabled })}
            className={`h-10 px-5 rounded-full font-body-sm text-body-sm font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
              settings.aiEnabled
                ? 'bg-primary text-on-primary hover:opacity-95'
                : 'bg-surface-container-high text-text-secondary hover:bg-surface-container-highest'
            }`}
          >
            {saving ? 'SAVING...' : settings.aiEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* AI Matching Mode Selection */}
        <div className="pt-4 border-t border-border-subtle/80 space-y-3">
          <label className="font-label-sm text-label-sm font-semibold text-text-primary block">
            AI Matching Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ aiMode: 'off' })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                settings.aiMode === 'off'
                  ? 'border-secondary bg-secondary-fixed/40 text-text-primary font-semibold ring-2 ring-secondary/30'
                  : 'border-border-subtle bg-surface-container-low hover:bg-surface-container text-text-secondary'
              }`}
            >
              <div className="font-body-sm text-body-sm font-bold text-text-primary">OFF</div>
              <div className="font-caption text-caption text-text-muted mt-1">
                AI companions are completely unavailable.
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ aiMode: 'manual' })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                settings.aiMode === 'manual'
                  ? 'border-secondary bg-secondary-fixed/40 text-text-primary font-semibold ring-2 ring-secondary/30'
                  : 'border-border-subtle bg-surface-container-low hover:bg-surface-container text-text-secondary'
              }`}
            >
              <div className="font-body-sm text-body-sm font-bold text-text-primary">MANUAL</div>
              <div className="font-caption text-caption text-text-muted mt-1">
                Administrator explicitly enables AI companions.
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ aiMode: 'auto' })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                settings.aiMode === 'auto'
                  ? 'border-secondary bg-secondary-fixed/40 text-text-primary font-semibold ring-2 ring-secondary/30'
                  : 'border-border-subtle bg-surface-container-low hover:bg-surface-container text-text-secondary'
              }`}
            >
              <div className="font-body-sm text-body-sm font-bold text-text-primary">AUTO</div>
              <div className="font-caption text-caption text-text-muted mt-1">
                Server uses AI according to configured threshold.
              </div>
            </button>
          </div>
        </div>

        {/* Threshold & Max Limit Settings */}
        <div className="pt-4 border-t border-border-subtle/80 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="aiThresholdInput" className="font-label-sm text-label-sm font-semibold text-text-primary block">
              AI Activation Threshold (Minimum Real Users)
            </label>
            <input
              id="aiThresholdInput"
              type="number"
              min="0"
              value={settings.aiThreshold}
              onChange={(e) => updateSettings({ aiThreshold: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary font-body-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
            <p className="font-caption text-caption text-text-muted">
              AI companions may participate when real-user availability falls below this number.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="maxAiChatsInput" className="font-label-sm text-label-sm font-semibold text-text-primary block">
              Maximum Simultaneous AI Conversations
            </label>
            <input
              id="maxAiChatsInput"
              type="number"
              min="0"
              value={settings.maxAiChats}
              onChange={(e) => updateSettings({ maxAiChats: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary font-body-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
            <p className="font-caption text-caption text-text-muted">
              Maximum number of concurrent AI companion chat rooms allowed.
            </p>
          </div>
        </div>

        {/* Online Count Display Booster / Offset Settings */}
        <div className="pt-6 border-t border-border-subtle/80 space-y-4">
          <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-primary">
            PUBLIC ONLINE USERS DISPLAY BOOSTER
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fakeOffsetInput" className="font-label-sm text-label-sm font-semibold text-text-primary block">
                Base Fake User Offset (+ N Users)
              </label>
              <input
                id="fakeOffsetInput"
                type="number"
                min="0"
                value={settings.fakeUserOffset}
                onChange={(e) => updateSettings({ fakeUserOffset: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary font-body-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <p className="font-caption text-caption text-text-muted">
                Adds a fixed baseline offset to the public online user count shown on the website.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="fakeMultiplierInput" className="font-label-sm text-label-sm font-semibold text-text-primary block">
                Online Users Multiplier (1.0x - 5.0x)
              </label>
              <input
                id="fakeMultiplierInput"
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={settings.fakeUserMultiplier}
                onChange={(e) => updateSettings({ fakeUserMultiplier: Math.max(1.0, parseFloat(e.target.value) || 1.0) })}
                className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary font-body-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <p className="font-caption text-caption text-text-muted">
                Multiplies real online sockets by this factor when emitting `onlineCount` to visitors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

