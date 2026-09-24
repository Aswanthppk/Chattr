import { UserMatch } from '../types';

export interface MockUserCandidate {
  id: string;
  name: string;
  flag: string;
  country: string;
  avatarUrl: string;
  status: string;
  allInterests: string[];
  icebreaker: string;
}

export const MOCK_USERS: MockUserCandidate[] = [
  {
    id: 'user_alex',
    name: 'Alex',
    flag: '🇨🇦',
    country: 'Canada',
    avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
    status: 'Ready to talk now',
    allInterests: ['Technology', 'Movies', 'Coding', 'Music'],
    icebreaker: 'What is a piece of speculative tech from sci-fi you genuinely wish existed today?'
  },
  {
    id: 'user_maya',
    name: 'Maya',
    flag: '🇯🇵',
    country: 'Japan',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-3u3l3rt4D_qM_mVtkcLDMNp01FXYPXAH--ZMm_Guoe3ult7LPLZh72gfHogjk-JVyxOMsXb_-HuVoboqCDFBJejVxewdI0UMJesEt3sCkRzf14X6LDjkkyTuz0MTGtMdfYtnhxR88QPtu0JKpIN1qS1dKgaoPd68sovxArwxYkqW0tty2zWJMUTOG6DvySPJyRiCUAKWW4qsaC4VKY45zc-QoIQK7qaRAfrX91-959mV9mwXlSVaOg',
    status: 'Ready to talk now',
    allInterests: ['Music', 'Travel', 'Photography', 'Art'],
    icebreaker: 'What song instantly transports you to a vivid, specific memory?'
  },
  {
    id: 'user_daniel',
    name: 'Daniel',
    flag: '🇩🇪',
    country: 'Germany',
    avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UxFA_PjCIfqEjotDxf6ECYnZlNq0JcydxK8q_XjNQ2A9FxRt3nvZ25Rh-5JTcf9oBWWRwv5feAfY4FqrWh6lmHLfF8NET62l8UhaOV7OjG4bp94H1R2UlUN7EEg7XYBYZOZCOQykLsmB1-ldOp6R9Ari8P7-DEEUhdjC_u_kTBjZPFWZvooWaAPX5RyhC4sjB3vOlPo5IYwkAyT_zbLp2OBcbmGLpIz2xydNZKj3dQa6F2PwPQhsyY2h0C',
    status: 'Ready to talk now',
    allInterests: ['Gaming', 'Technology', 'Anime', 'Fitness'],
    icebreaker: 'If you had to live inside any video game universe for a week, which would you pick?'
  },
  {
    id: 'user_sarah',
    name: 'Sarah',
    flag: '🇬🇧',
    country: 'United Kingdom',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-3u3l3rt4D_qM_mVtkcLDMNp01FXYPXAH--ZMm_Guoe3ult7LPLZh72gfHogjk-JVyxOMsXb_-HuVoboqCDFBJejVxewdI0UMJesEt3sCkRzf14X6LDjkkyTuz0MTGtMdfYtnhxR88QPtu0JKpIN1qS1dKgaoPd68sovxArwxYkqW0tty2zWJMUTOG6DvySPJyRiCUAKWW4qsaC4VKY45zc-QoIQK7qaRAfrX91-959mV9mwXlSVaOg',
    status: 'Ready to talk now',
    allInterests: ['Books', 'Movies', 'Food', 'Travel'],
    icebreaker: 'If you could turn any obscure book or concept into a feature film, what would it be?'
  }
];

export class MatchingService {
  public static async findMatch(
    userInterests: string[],
    excludeUserIds: string[] = []
  ): Promise<UserMatch> {
    await new Promise((resolve) => setTimeout(resolve, 1400 + Math.random() * 800));

    const eligible = MOCK_USERS.filter((u) => !excludeUserIds.includes(u.id));
    const candidates = eligible.length > 0 ? eligible : MOCK_USERS;

    const scored = candidates.map((cand) => {
      const overlap = cand.allInterests.filter((topic) => userInterests.includes(topic));
      return {
        candidate: cand,
        sharedInterests: overlap.length > 0 ? overlap : [cand.allInterests[0], cand.allInterests[1]],
        score: overlap.length
      };
    });

    scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
    const chosen = scored[0];

    return {
      id: chosen.candidate.id,
      name: chosen.candidate.name,
      flag: chosen.candidate.flag,
      country: chosen.candidate.country,
      avatarUrl: chosen.candidate.avatarUrl,
      status: chosen.candidate.status,
      interests: chosen.sharedInterests,
      icebreaker: chosen.candidate.icebreaker
    };
  }
}
