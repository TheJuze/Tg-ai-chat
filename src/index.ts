import { TelegramBot } from './bot';
import { logger } from './utils/logger';
import { config } from './config';

async function main() {
  try {
    logger.info('Starting Telegram AI Chat Bot...', {
      nodeEnv: config.nodeEnv,
      logLevel: config.logLevel,
      openaiModel: config.openai.model,
    });

    const bot = new TelegramBot();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      process.exit(1);
    });

    await bot.start();
    
    logger.info('Bot is running successfully');
    
  } catch (error) {
    logger.error('Failed to start application', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
} 