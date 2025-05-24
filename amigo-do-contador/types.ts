
export enum SenderType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system', // For system messages like errors or info
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: Date;
}
