import winston from 'winston';
import { config } from '../config';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: fileFormat,
  defaultMeta: { service: 'telegram-bot' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to console as well
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Create a stream object for Morgan HTTP logging
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
}; 