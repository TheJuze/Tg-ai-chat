import { Message, Conversation } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

export class ConversationService {
  private conversations: Map<number, Conversation> = new Map();

  addMessage(userId: number, role: 'user' | 'assistant' | 'system', content: string): void {
    const message: Message = {
      role,
      content,
      timestamp: Date.now(),
    };

    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        userId,
        messages: [],
        lastActivity: Date.now(),
      });
    }

    const conversation = this.conversations.get(userId)!;
    conversation.messages.push(message);
    conversation.lastActivity = Date.now();

    // Trim conversation if it exceeds the maximum length
    this.trimConversation(userId);

    logger.info('Message added to conversation', {
      userId,
      role,
      contentLength: content.length,
      totalMessages: conversation.messages.length,
    });
  }

  getConversation(userId: number): Message[] {
    const conversation = this.conversations.get(userId);
    return conversation ? conversation.messages : [];
  }

  clearConversation(userId: number): void {
    this.conversations.delete(userId);
    logger.info('Conversation cleared', { userId });
  }

  private trimConversation(userId: number): void {
    const conversation = this.conversations.get(userId);
    if (!conversation) return;

    if (conversation.messages.length > config.maxConversationLength) {
      // Keep the system message (if any) and the most recent messages
      const systemMessages = conversation.messages.filter(msg => msg.role === 'system');
      const nonSystemMessages = conversation.messages.filter(msg => msg.role !== 'system');
      
      // Keep the most recent messages, leaving room for system messages
      const maxNonSystemMessages = config.maxConversationLength - systemMessages.length;
      const recentMessages = nonSystemMessages.slice(-maxNonSystemMessages);
      
      conversation.messages = [...systemMessages, ...recentMessages];
      
      logger.info('Conversation trimmed', {
        userId,
        newLength: conversation.messages.length,
        maxLength: config.maxConversationLength,
      });
    }
  }

  getConversationStats(): { totalUsers: number; totalMessages: number } {
    let totalMessages = 0;
    this.conversations.forEach(conversation => {
      totalMessages += conversation.messages.length;
    });

    return {
      totalUsers: this.conversations.size,
      totalMessages,
    };
  }

  cleanupOldConversations(maxAgeHours: number = 24): void {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [userId, conversation] of this.conversations.entries()) {
      if (conversation.lastActivity < cutoffTime) {
        this.conversations.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up old conversations', {
        cleanedCount,
        remainingConversations: this.conversations.size,
      });
    }
  }

  // Add a system message to set the bot's behavior
  addSystemMessage(userId: number, systemPrompt: string): void {
    // Remove any existing system messages
    const conversation = this.conversations.get(userId);
    if (conversation) {
      conversation.messages = conversation.messages.filter(msg => msg.role !== 'system');
    }

    // Add the new system message
    this.addMessage(userId, 'system', systemPrompt);
  }
} 