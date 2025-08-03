import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Message, OpenAIResponse } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateResponse(messages: Message[]): Promise<OpenAIResponse> {
    try {
      logger.info('Generating OpenAI response', {
        messageCount: messages.length,
        model: config.openai.model,
      });

      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response content received from OpenAI');
      }

      logger.info('OpenAI response generated successfully', {
        responseLength: response.length,
        usage: completion.usage,
      });

      return {
        content: response,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      logger.error('Error generating OpenAI response', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Handle specific OpenAI errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.status === 401) {
          throw new Error('Invalid API key. Please check your configuration.');
        } else if (error.status === 400) {
          throw new Error('Invalid request. Please check your message content.');
        }
      }

      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      logger.info('OpenAI connection test successful');
      return true;
    } catch (error) {
      logger.error('OpenAI connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // Helper method to format response for Telegram with proper MarkdownV2
  formatResponseForTelegram(response: string): string {
    // Convert common markdown to Telegram MarkdownV2 format
    let formatted = response
      // Convert **text** to *text* (bold)
      .replace(/\*\*(.*?)\*\*/g, '*$1*')
      // Convert __text__ to _text_ (italic)
      .replace(/__(.*?)__/g, '_$1_')
      // Convert ~~text~~ to ~text~ (strikethrough)
      .replace(/~~(.*?)~~/g, '~$1~');

    // Handle code blocks and inline code more carefully
    formatted = formatted
      // Temporarily replace code blocks to protect them
      .replace(/```([\s\S]*?)```/g, '§BLOCK§$1§BLOCK§')
      // Temporarily replace inline code
      .replace(/`([^`]+)`/g, '§CODE§$1§CODE§')
      // Temporarily replace links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '§LINK§$1§LINK§($2)')
      // Temporarily replace bold
      .replace(/\*([^*]+)\*/g, '§BOLD§$1§BOLD§')
      // Temporarily replace italic
      .replace(/_([^_]+)_/g, '§ITALIC§$1§ITALIC§')
      // Temporarily replace strikethrough
      .replace(/~([^~]+)~/g, '§STRIKE§$1§STRIKE§')
      
      // Escape all special characters
      .replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
      
      // Restore our markdown markers
      .replace(/§BOLD§/g, '*')
      .replace(/§ITALIC§/g, '_')
      .replace(/§CODE§/g, '`')
      .replace(/§BLOCK§/g, '```')
      .replace(/§LINK§/g, '[')
      .replace(/§STRIKE§/g, '~');

    // Limit message length (Telegram has a 4096 character limit)
    if (formatted.length > 4000) {
      return formatted.substring(0, 4000) + '\n\n...\n\n*Сообщение обрезано из-за ограничений Telegram*';
    }
    
    return formatted;
  }
} 