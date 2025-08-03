import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { logger } from '../utils/logger';
import { OpenAIService } from '../services/openai';
import { ConversationService } from '../services/conversation';
import { BotStats } from '../types';

export class TelegramBot {
  private bot: Telegraf<Context>;
  private openaiService: OpenAIService;
  private conversationService: ConversationService;
  private startTime: number;
  private totalMessages: number = 0;

  constructor() {
    this.bot = new Telegraf(config.telegramToken);
    this.openaiService = new OpenAIService();
    this.conversationService = new ConversationService();
    this.startTime = Date.now();
    
    this.setupMiddleware();
    this.setupCommands();
    this.setupMessageHandlers();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.bot.use(async (ctx, next) => {
      const start = Date.now();
      logger.info('Incoming message', {
        userId: ctx.from?.id,
        username: ctx.from?.username,
        messageType: ctx.message ? 'message' : 'callback_query',
        chatType: ctx.chat?.type
      });
      
      await next();
      
      const ms = Date.now() - start;
      logger.info('Message processed', { processingTime: ms });
    });
  }

  private setupCommands(): void {
    // Start command
    this.bot.start(async (ctx) => {
      const welcomeMessage = `🤖 *Welcome to AI Chat Bot\\!*

I'm here to help you with any questions or conversations\\. Just send me a message, and I'll respond using AI\\.

*Available commands:*
• /start \\- Show this welcome message
• /help \\- Show help information
• /clear \\- Clear our conversation history
• /status \\- Check bot status

Let's start chatting\\! 🚀`;

      await ctx.reply(welcomeMessage, { parse_mode: 'MarkdownV2' });
      logger.info('Start command received', { userId: ctx.from?.id });
    });

    // Help command
    this.bot.help(async (ctx) => {
      const helpMessage = `📚 *Help and Commands*

*Main commands:*
• Just send me any message to start a conversation
• /start \\- Welcome message
• /help \\- This help message
• /clear \\- Clear conversation history
• /status \\- Bot status

*How to use:*
1\\. Send me any question or message
2\\. I'll respond using AI
3\\. Our conversation will be remembered for context
4\\. Use /clear to start fresh

*Tips:*
• Be specific in your questions
• I can help with various topics
• Long conversations are automatically trimmed for efficiency

Need anything else? Just ask\\! 😊`;

      await ctx.reply(helpMessage, { parse_mode: 'MarkdownV2' });
    });

    // Clear command
    this.bot.command('clear', async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        this.conversationService.clearConversation(userId);
        const clearMessage = '🗑️ *Conversation history cleared\\!*\n\nStart fresh with a new message\\.';
        await ctx.reply(clearMessage, { parse_mode: 'MarkdownV2' });
        logger.info('Conversation cleared by user', { userId });
      }
    });

    // Status command
    this.bot.command('status', async (ctx) => {
      const userId = ctx.from?.id;
      if (userId) {
        const conversation = this.conversationService.getConversation(userId);
        const messageCount = conversation.length;
        const stats = this.conversationService.getConversationStats();
        
        const statusMessage = `📊 *Bot Status*

*Your session:*
• Messages in history: ${messageCount}
• Model: ${config.openai.model}

*Bot information:*
• Status: ✅ Online
• Version: 1\\.0\\.0
• Uptime: ${this.getUptime()}
• Total users: ${stats.totalUsers}
• Total messages: ${stats.totalMessages}

Everything is working great\\! 🎉`;

        await ctx.reply(statusMessage, { parse_mode: 'MarkdownV2' });
      }
    });
  }

  private setupMessageHandlers(): void {
    // Handle text messages
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from?.id;
      const message = ctx.message?.text;

      if (!userId || !message) {
        return;
      }

      try {
        this.totalMessages++;

        // Add user message to conversation
        this.conversationService.addMessage(userId, 'user', message);

        // Show typing indicator
        await ctx.replyWithChatAction('typing');

        // Get conversation history
        const messages = this.conversationService.getConversation(userId);
        
        // Add system prompt if this is a new conversation
        if (messages.length === 1) {
          const systemPrompt = `You are a helpful AI assistant. You can help with various topics including programming, general knowledge, writing, and more. Be concise but informative in your responses.

IMPORTANT: When formatting text, use Telegram MarkdownV2 format:
- Use *text* for bold (not **text**)
- Use _text_ for italic (not __text__)
- Use \`text\` for inline code
- Use \`\`\`text\`\`\` for code blocks
- Use [text](url) for links
- Use ~text~ for strikethrough

Always escape special characters properly for Telegram MarkdownV2.`;
          this.conversationService.addSystemMessage(userId, systemPrompt);
        }

        // Generate AI response
        const aiResponse = await this.openaiService.generateResponse(messages);

        // Add AI response to conversation
        this.conversationService.addMessage(userId, 'assistant', aiResponse.content);

        // Format response for Telegram
        const formattedResponse = this.openaiService.formatResponseForTelegram(aiResponse.content);

        // Send response to user
        await ctx.reply(formattedResponse, { parse_mode: 'MarkdownV2' });

        logger.info('Message processed successfully', {
          userId,
          messageLength: message.length,
          responseLength: aiResponse.content.length,
          usage: aiResponse.usage
        });

      } catch (error) {
        logger.error('Error processing message', { 
          userId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        const errorMessage = '❌ *Error*\n\nSorry, an error occurred while processing your message\\. Please try again later\\!';
        await ctx.reply(errorMessage, { parse_mode: 'MarkdownV2' });
      }
    });

    // Handle non-text messages
    this.bot.on(['photo', 'video', 'audio', 'document', 'sticker'], async (ctx) => {
      const unsupportedMessage = '📝 *Text only*\n\nI can only process text messages at the moment\\. Please send your question as text\\!';
      await ctx.reply(unsupportedMessage, { parse_mode: 'MarkdownV2' });
    });
  }

  private setupErrorHandling(): void {
    this.bot.catch((err, ctx) => {
      logger.error('Bot error', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        userId: ctx.from?.id 
      });
    });
  }

  private getUptime(): string {
    const uptime = Date.now() - this.startTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Telegram bot...');
      
      // Test bot token first
      await this.testBotToken();
      
      // Test OpenAI connection
      const openaiConnected = await this.openaiService.testConnection();
      if (!openaiConnected) {
        throw new Error('OpenAI connection test failed');
      }
      
      await this.bot.launch();
      logger.info('Telegram bot started successfully');
      
      // Set up periodic cleanup of old conversations
      setInterval(() => {
        this.conversationService.cleanupOldConversations();
      }, 30 * 60 * 1000); // Every 30 minutes
      
    } catch (error) {
      logger.error('Failed to start bot', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async testBotToken(): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/getMe`);
      if (!response.ok) {
        throw new Error(`Telegram API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json() as { ok: boolean; result?: { username: string; id: number; first_name: string }; description?: string };
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }
      if (data.result) {
        logger.info('Bot token validated successfully', { 
          botName: data.result.username,
          botId: data.result.id 
        });
      }
    } catch (error) {
      logger.error('Bot token validation failed', { error });
      throw new Error('Invalid bot token or network issue');
    }
  }

  async stop(): Promise<void> {
    try {
      await this.bot.stop();
      logger.info('Telegram bot stopped');
    } catch (error) {
      logger.error('Error stopping bot', { error });
    }
  }

  getStats(): BotStats {
    const stats = this.conversationService.getConversationStats();
    return {
      totalUsers: stats.totalUsers,
      totalMessages: this.totalMessages,
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
    };
  }
} 