export type ScreenState = 'welcome' | 'interests' | 'matching' | 'chat';

export interface UserMatch {
  id: string;
  name: string;
  flag: string;
  country: string;
  avatarUrl: string;
  status: string;
  interests: string[];
  icebreaker: string;
  roomId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'partner' | 'system';
  text: string;
  timestamp: string;
  delivered?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
}
