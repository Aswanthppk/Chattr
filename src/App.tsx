import React, { useEffect, useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InterestScreen } from './components/InterestScreen';
import { MatchingScreen } from './components/MatchingScreen';
import { ChatScreen } from './components/ChatScreen';
import { ScreenState, UserMatch } from './types';
import { socketService } from './services/SocketService';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [userName, setUserName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Technology',
    'Movies',
    'Gaming'
  ]);
  const [currentMatch, setCurrentMatch] = useState<UserMatch | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1420);

  useEffect(() => {
    const unsub = socketService.onOnlineCount((count) => {
      setOnlineCount(count);
    });
    return () => {
      unsub();
    };
  }, []);

  // Navigation handlers
  const handleWelcomeContinue = (name: string) => {
    setUserName(name);
    setScreen('interests');
  };

  const handleToggleInterest = (topic: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      }
      if (prev.length >= 5) return prev;
      return [...prev, topic];
    });
  };

  const handleResetInterests = () => {
    setSelectedInterests([]);
  };

  const handleStartMatching = () => {
    setCurrentMatch(null);
    setScreen('matching');
  };

  const handleMatchFound = (match: UserMatch) => {
    setCurrentMatch(match);
    setScreen('chat'); // Both sides immediately enter chat!
  };

  const handleEndChat = () => {
    setCurrentMatch(null);
    setScreen('interests');
  };

  const handleStartAnotherChat = () => {
    setCurrentMatch(null);
    setScreen('matching');
  };

  const handleReturnHome = () => {
    setCurrentMatch(null);
    setScreen('welcome');
  };

  const handleBlockUser = (userId: string) => {
    setBlockedUsers((prev) => [...prev, userId]);
  };

  return (
    <div className="w-full min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-[#e3dfff] selection:text-[#5146d0]">
      {screen === 'welcome' && (
        <WelcomeScreen
          onContinue={handleWelcomeContinue}
          initialName={userName}
          onlineCount={onlineCount}
        />
      )}

      {screen === 'interests' && (
        <InterestScreen
          userName={userName}
          selectedInterests={selectedInterests}
          onToggleInterest={handleToggleInterest}
          onResetInterests={handleResetInterests}
          onStartChat={handleStartMatching}
          onBack={() => setScreen('welcome')}
        />
      )}

      {screen === 'matching' && (
        <MatchingScreen
          userName={userName}
          userInterests={selectedInterests}
          blockedUsers={blockedUsers}
          onMatchFound={handleMatchFound}
          onCancel={() => setScreen('interests')}
          currentMatch={currentMatch}
        />
      )}

      {screen === 'chat' && currentMatch && (
        <ChatScreen
          match={currentMatch}
          userName={userName}
          userInterests={selectedInterests}
          onEndChat={handleEndChat}
          onBlockUser={handleBlockUser}
          onStartAnotherChat={handleStartAnotherChat}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
};

export default App;
