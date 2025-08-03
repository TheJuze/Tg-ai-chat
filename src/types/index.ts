export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  userId: number;
  messages: Message[];
  lastActivity: number;
}

export interface BotStats {
  totalUsers: number;
  totalMessages: number;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface OpenAIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | undefined;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
} 