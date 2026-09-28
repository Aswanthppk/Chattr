import React, { useEffect, useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InterestScreen } from './components/InterestScreen';
import { MatchingScreen } from './components/MatchingScreen';
import { ChatScreen } from './components/ChatScreen';
import { ScreenState, UserMatch } from './types';
import { socketService } from './services/SocketService';
import { analytics } from './utils/analytics';

// Dedicated SEO Pages
import { RandomChatPage } from './components/pages/RandomChatPage';
import { RandomChatWithStrangersPage } from './components/pages/RandomChatWithStrangersPage';
import { ChatWithStrangersPage } from './components/pages/ChatWithStrangersPage';
import { MeetNewPeoplePage } from './components/pages/MeetNewPeoplePage';
import { HowItWorksPage } from './components/pages/HowItWorksPage';
import { SafetyPage } from './components/pages/SafetyPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TermsPage } from './components/pages/TermsPage';
import { CommunityGuidelinesPage } from './components/pages/CommunityGuidelinesPage';
import { ContactPage } from './components/pages/ContactPage';
import { NotFoundPage } from './components/pages/NotFoundPage';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [userName, setUserName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Technology',
    'Movies',
    'Gaming'
  ]);
  const [chatMode, setChatMode] = useState<'text' | 'video'>('text');
  const [currentMatch, setCurrentMatch] = useState<UserMatch | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('chattr_admin_token') : null;
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return typeof window !== 'undefined'
      ? sessionStorage.getItem('chattr_admin_email') || 'admin@chattr.world'
      : 'admin@chattr.world';
  });

  const handleAdminLoginSuccess = (token: string, email: string) => {
    sessionStorage.setItem('chattr_admin_token', token);
    sessionStorage.setItem('chattr_admin_email', email);
    setAdminToken(token);
    setAdminEmail(email);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('chattr_admin_token');
    sessionStorage.removeItem('chattr_admin_email');
    setAdminToken(null);
  };

  // Sync with browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    analytics.trackPageView(currentPath, document.title);
  }, [currentPath]);

  // Online count subscription
  useEffect(() => {
    const unsub = socketService.onOnlineCount((count) => {
      setOnlineCount(count);
    });
    return () => {
      unsub();
    };
  }, []);

  // Navigation handlers
  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChatFromPage = () => {
    handleNavigate('/');
    setScreen('welcome');
    setTimeout(() => {
      const input = document.getElementById('userName');
      if (input) input.focus();
    }, 100);
  };

  const handleWelcomeContinue = (name: string) => {
    setUserName(name);
    setScreen('interests');
    analytics.track('start_chat', { name });
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
    analytics.track('match_found', { partner: match.name });
  };

  const handleEndChat = () => {
    setCurrentMatch(null);
    setScreen('interests');
    analytics.track('chat_ended');
  };

  const handleStartAnotherChat = () => {
    setCurrentMatch(null);
    setScreen('matching');
    analytics.track('skip_chat');
  };

  const handleReturnHome = () => {
    setCurrentMatch(null);
    setScreen('welcome');
  };

  const handleBlockUser = (userId: string) => {
    setBlockedUsers((prev) => [...prev, userId]);
  };

  // Render dedicated SEO pages if path is not root
  const cleanPath = currentPath.replace(/\/+$/, '') || '/';

  if (cleanPath === '/random-chat') {
    return <RandomChatPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/random-chat-with-strangers') {
    return <RandomChatWithStrangersPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/chat-with-strangers') {
    return <ChatWithStrangersPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/meet-new-people') {
    return <MeetNewPeoplePage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/how-random-chat-works') {
    return <HowItWorksPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/safety') {
    return <SafetyPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/privacy') {
    return <PrivacyPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/terms') {
    return <TermsPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/community-guidelines') {
    return <CommunityGuidelinesPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }
  if (cleanPath === '/contact') {
    return <ContactPage onNavigate={handleNavigate} onStartChat={handleStartChatFromPage} />;
  }

  // Protected Secret Admin Dashboard Route
  const ADMIN_ROUTE_PATH = (import.meta as any).env?.VITE_ADMIN_ROUTE_PATH || '/chattr-ops-8f3x9';

  if (cleanPath.startsWith(ADMIN_ROUTE_PATH)) {
    if (!adminToken) {
      return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
    }
    return (
      <AdminDashboard
        token={adminToken}
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
      />
    );
  }

  // If path is not root ('/'), URL does not exist -> Render 404 Page
  if (cleanPath !== '/') {
    return (
      <NotFoundPage
        onNavigate={handleNavigate}
        onStartChat={handleStartChatFromPage}
        currentPath={cleanPath}
      />
    );
  }

  // Root path / default app experience
  return (
    <div className="w-full min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-[#e3dfff] selection:text-[#5146d0]">
      {screen === 'welcome' && (
        <WelcomeScreen
          onContinue={handleWelcomeContinue}
          initialName={userName}
          onlineCount={onlineCount}
          onNavigate={handleNavigate}
        />
      )}

      {screen === 'interests' && (
        <InterestScreen
          userName={userName}
          selectedInterests={selectedInterests}
          onlineCount={onlineCount}
          chatMode={chatMode}
          onSelectChatMode={setChatMode}
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
          chatMode={chatMode}
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
