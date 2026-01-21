
export enum AIMode {
  CHAT = 'CHAT',
  SEARCH = 'SEARCH',
  IMAGE = 'IMAGE'
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  name: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode: AIMode;
  imageUrl?: string;
  groundingUrls?: Array<{ title: string; uri: string }>;
  suggestions?: string[];
  attachments?: Attachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}
