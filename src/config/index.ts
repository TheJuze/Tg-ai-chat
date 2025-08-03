import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'Telegram bot token is required'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  MAX_CONVERSATION_LENGTH: z.string().transform(Number).default('50'),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default('1000'),
  OPENAI_TEMPERATURE: z.string().transform(Number).default('0.7'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  telegramToken: env.TELEGRAM_BOT_TOKEN,
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    maxTokens: env.OPENAI_MAX_TOKENS,
    temperature: env.OPENAI_TEMPERATURE,
  },
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  maxConversationLength: env.MAX_CONVERSATION_LENGTH,
} as const;

export type Config = typeof config; 