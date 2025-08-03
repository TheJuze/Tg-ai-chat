# Telegram AI Chat Bot

A powerful Telegram bot built with TypeScript that integrates with OpenAI's API to provide intelligent conversational responses. The bot supports conversation history, markdown formatting, and is designed for deployment on personal servers using Docker.

## Features

- 🤖 **AI-Powered Responses**: Uses OpenAI's GPT models for intelligent conversations
- 💬 **Conversation Memory**: Maintains context across multiple messages
- 📝 **Markdown Support**: Rich text formatting with Telegram MarkdownV2 (converts **bold** to *bold*)
- 🐳 **Docker Ready**: Easy deployment with Docker and docker-compose
- 📊 **Built-in Logging**: Comprehensive logging with Winston
- 🔧 **TypeScript**: Full TypeScript support with strict type checking
- 🛡️ **Error Handling**: Robust error handling and graceful shutdown
- 📈 **Statistics**: Built-in bot statistics and monitoring

## Prerequisites

- Node.js 18+ or Docker
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenAI API Key (from [OpenAI Platform](https://platform.openai.com/))

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tg-ai-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
LOG_LEVEL=info
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Start the bot
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Set Environment Variables**

Create a `.env` file in the project root:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

2. **Build and Run**

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Docker Directly

```bash
# Build the image
docker build -t telegram-ai-bot .

# Run the container
docker run -d \
  --name telegram-bot \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  telegram-ai-bot
```

## Bot Commands

- `/start` - Welcome message and bot introduction
- `/help` - Show help information and available commands
- `/clear` - Clear conversation history
- `/status` - Show bot status and statistics

## Configuration Options

### Message Formatting

The bot automatically converts common markdown to Telegram MarkdownV2 format:
- `**text**` → `*text*` (bold)
- `__text__` → `_text_` (italic)
- `~~text~~` → `~text~` (strikethrough)
- `` `code` `` → `` `code` `` (inline code)
- `[text](url)` → `[text](url)` (links)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Required |
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `NODE_ENV` | Environment (development/production) | `development` |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` |
| `MAX_CONVERSATION_LENGTH` | Max messages in conversation history | `50` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` |
| `OPENAI_MAX_TOKENS` | Maximum tokens for responses | `1000` |
| `OPENAI_TEMPERATURE` | Response creativity (0.0-1.0) | `0.7` |

### OpenAI Model Options

- `gpt-3.5-turbo` - Fast, cost-effective (default)
- `gpt-4` - More capable, higher cost
- `gpt-4-turbo` - Latest GPT-4 model

## Development

### Available Scripts

```bash
# Development
npm run dev          # Run with ts-node
npm run watch        # Run with nodemon
npm run build        # Build TypeScript
npm start           # Run built application

# Linting
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues

# Testing
npm run test:connection  # Test bot and OpenAI connections
```

### Project Structure

```
src/
├── bot/           # Telegram bot implementation
├── config/        # Configuration management
├── services/      # Business logic services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── index.ts       # Application entry point
```

## Logging

The bot uses Winston for structured logging. Logs are written to:

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output (in development)

### Log Levels

- `error` - Errors only
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - Detailed debugging information

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Bot Token**: Keep your Telegram bot token secure
3. **API Keys**: Store OpenAI API keys securely
4. **Docker**: Use non-root user in production containers
5. **Logs**: Be careful with sensitive information in logs

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if bot token is correct
   - Verify bot is not blocked by users
   - Check logs for errors

2. **OpenAI API errors**
   - Verify API key is valid
   - Check API quota and billing
   - Ensure model name is correct

3. **Docker issues**
   - Check if ports are available
   - Verify environment variables are set
   - Check container logs

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
```

### Connection Testing

Test your bot and OpenAI connections:

```bash
npm run test:connection
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Open an issue on GitHub

## Changelog

### v1.0.0
- Initial release
- Telegram bot with OpenAI integration
- Docker support
- Conversation memory
- Markdown formatting
- Comprehensive logging
