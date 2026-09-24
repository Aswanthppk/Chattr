import { ChatMessage, UserMatch } from '../types';

export type MessageListener = (message: ChatMessage) => void;
export type TypingListener = (isTyping: boolean) => void;

export class ChatService {
  private match: UserMatch;
  private messageListeners: MessageListener[] = [];
  private typingListeners: TypingListener[] = [];
  private responseCount: number = 0;

  constructor(match: UserMatch) {
    this.match = match;
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    };
  }

  public onTyping(listener: TypingListener): () => void {
    this.typingListeners.push(listener);
    return () => {
      this.typingListeners = this.typingListeners.filter((l) => l !== listener);
    };
  }

  public async connect(): Promise<ChatMessage[]> {
    // Return initial greeting from partner
    const initialMsg: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'partner',
      text: 'Hey! 👋',
      timestamp: this.formatTime(new Date())
    };
    return [initialMsg];
  }

  public sendMessage(text: string): ChatMessage {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: this.formatTime(new Date()),
      delivered: true
    };

    // Emit user message
    this.emitMessage(userMsg);

    // Schedule mock reply with typing indicator
    this.schedulePartnerResponse(text);

    return userMsg;
  }

  private schedulePartnerResponse(userText: string) {
    const lower = userText.toLowerCase();
    let replyText = '';

    if (lower.includes('where are you from') || lower.includes('location')) {
      replyText = `I'm based in ${this.match.country}! The weather is unusually calm here today. How about you?`;
    } else if (lower.includes('what are you into') || lower.includes('interests') || lower.includes('hobbies')) {
      replyText = `Mostly ${this.match.interests.join(' and ')}. Right now I'm building an ambient audio synthesizer!`;
    } else if (lower.includes('favorite movie') || lower.includes('movie')) {
      replyText = `Definitely 2001: A Space Odyssey and Blade Runner 2049. Have you watched either recently?`;
    } else if (lower.includes('sci-fi') || lower.includes('noir')) {
      replyText = `Sci-fi with neo-noir aesthetics is peak cinema. The rainy neon mood just hits differently.`;
    } else if (lower.includes('hi') || lower.includes('hey') || lower.includes('hello')) {
      if (this.responseCount === 0) {
        replyText = `Where are you from?`;
      } else {
        replyText = `Great to connect! What are you working on or thinking about right now?`;
      }
    } else {
      const genericReplies = [
        `Totally agree. Simplicity completely changes the way we perceive software.`,
        `That reminds me of an exhibition I visited last month. Really intriguing perspective!`,
        `Nice! I love discovering unexpected thoughts through spontaneous chats like this.`,
        `Haha exactly. Have you had a chance to explore other topics in Orbit yet?`
      ];
      replyText = genericReplies[this.responseCount % genericReplies.length];
    }

    this.responseCount++;

    // 600ms before typing indicator appears
    setTimeout(() => {
      this.emitTyping(true);

      // Typing duration 1200ms - 1800ms
      setTimeout(() => {
        this.emitTyping(false);

        const partnerMsg: ChatMessage = {
          id: `msg_partner_${Date.now()}`,
          sender: 'partner',
          text: replyText,
          timestamp: this.formatTime(new Date())
        };
        this.emitMessage(partnerMsg);
      }, 1500);
    }, 600);
  }

  private emitMessage(msg: ChatMessage) {
    this.messageListeners.forEach((listener) => listener(msg));
  }

  private emitTyping(isTyping: boolean) {
    this.typingListeners.forEach((listener) => listener(isTyping));
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  public disconnect() {
    this.messageListeners = [];
    this.typingListeners = [];
  }
}
