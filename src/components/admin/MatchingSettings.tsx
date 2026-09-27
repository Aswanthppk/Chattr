import React from 'react';

interface MatchingSettingsProps {
  token: string;
}

export const MatchingSettings: React.FC<MatchingSettingsProps> = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-sm text-headline-sm font-bold text-text-primary">
          Matching Engine Settings
        </h2>
        <p className="font-body-sm text-body-sm text-text-secondary">
          Configure matchmaking priority rules and queue timeout behavior.
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-6">
        <div className="space-y-4">
          <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
            MATCHING POLICY
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-semibold text-text-primary">Real-user matching</span>
                <span className="px-2 py-0.5 rounded-full bg-state-success/15 text-state-success text-xs font-bold">Enabled</span>
              </div>
              <p className="font-caption text-caption text-text-muted">Real users are always prioritized first.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-semibold text-text-primary">AI matching</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">Active</span>
              </div>
              <p className="font-caption text-caption text-text-muted">Offered only when no suitable real user is available.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-semibold text-text-primary">Interest matching</span>
                <span className="px-2 py-0.5 rounded-full bg-state-success/15 text-state-success text-xs font-bold">Enabled</span>
              </div>
              <p className="font-caption text-caption text-text-muted">Pairs users sharing at least 1 interest topic.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle/80 space-y-3">
          <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
            QUEUE DISPATCH RULES
          </h3>
          <ul className="space-y-2 font-body-sm text-body-sm text-text-primary">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
              <span>1. Search for an available real user matching selected interests first.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
              <span>2. If no shared interest match is found, pair with another available real user.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
              <span>3. If no suitable real user is available and AI matching is enabled according to threshold, offer an AI companion.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
              <span>4. AI companion chats are ALWAYS clearly identified to the user (`Alex — AI` / `AI companion`).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
