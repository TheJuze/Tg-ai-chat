# Quick Start Guide

Get your Telegram AI bot running in 5 minutes!

## Prerequisites

1. **Telegram Bot Token** - Get from [@BotFather](https://t.me/botfather)
2. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/)
3. **Docker** - Install from [Docker](https://docs.docker.com/get-docker/)

## Setup Steps

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd tg-ai-chat
```

### 2. Configure Environment
```bash
cp env.example .env
```

Edit `.env` with your credentials:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deploy with Docker
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### 4. Test Your Bot
1. Find your bot on Telegram (using the username from BotFather)
2. Send `/start` to begin
3. Ask any question!

## Alternative: Local Development

If you prefer to run locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the bot
npm start
```

## Troubleshooting

### Bot not responding?
- Check if container is running: `docker-compose ps`
- View logs: `docker-compose logs -f`
- Test connections: `npm run test:connection`

### Environment issues?
- Ensure `.env` file exists and has correct values
- Check that both API keys are valid
- Verify Docker is running

### Need to restart?
```bash
docker-compose restart
```

## Next Steps

- Customize the bot's personality in `src/bot/index.ts`
- Adjust OpenAI settings in `.env`
- Add more commands in the bot handlers
- Set up monitoring and alerts

## Support

- Check the main [README.md](README.md) for detailed documentation
- Review logs for error messages
- Open an issue on GitHub for bugs

---

**Happy chatting! 🤖💬** 