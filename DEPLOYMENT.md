# Server Deployment Guide

This guide will help you deploy your Telegram AI bot to your personal server.

## Prerequisites

1. **Server Requirements:**
   - Linux server (Ubuntu 20.04+ recommended)
   - Docker and Docker Compose installed
   - At least 1GB RAM
   - Stable internet connection

2. **Domain/SSL (Optional but Recommended):**
   - Domain name pointing to your server
   - SSL certificate (Let's Encrypt)

## Step-by-Step Deployment

### 1. Server Setup

#### Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again, or run:
newgrp docker
```

#### Create Project Directory

```bash
# Create project directory
mkdir -p /opt/telegram-bot
cd /opt/telegram-bot
```

### 2. Upload Your Code

#### Option A: Git Clone (Recommended)

```bash
# Clone your repository
git clone <your-repo-url> .
```

#### Option B: Upload Files Manually

```bash
# Upload files via SCP or SFTP
scp -r ./tg-ai-chat/* user@your-server:/opt/telegram-bot/
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

Configure your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info

# Conversation Settings
MAX_CONVERSATION_LENGTH=50

# OpenAI Model Settings
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

### 4. Deploy with Docker

```bash
# Build and start the container
docker-compose up -d --build

# Check if container is running
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Test Your Bot

1. Find your bot on Telegram
2. Send `/start` to begin
3. Test with a simple question

## Production Optimizations

### 1. Set Up Log Rotation

Create logrotate configuration:

```bash
sudo nano /etc/logrotate.d/telegram-bot
```

Add:

```
/opt/telegram-bot/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 bot bot
    postrotate
        docker-compose -f /opt/telegram-bot/docker-compose.yml restart telegram-bot
    endscript
}
```

### 2. Set Up Monitoring

Create a simple health check script:

```bash
nano /opt/telegram-bot/scripts/health-check.sh
```

```bash
#!/bin/bash

# Health check script
if ! docker-compose -f /opt/telegram-bot/docker-compose.yml ps | grep -q "Up"; then
    echo "Bot is down, restarting..."
    docker-compose -f /opt/telegram-bot/docker-compose.yml up -d
    # Send notification (optional)
    # curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    #     -d "chat_id=$ADMIN_CHAT_ID" \
    #     -d "text=Bot was restarted automatically"
fi
```

Make it executable:

```bash
chmod +x /opt/telegram-bot/scripts/health-check.sh
```

Add to crontab:

```bash
crontab -e
```

Add:

```
# Check bot health every 5 minutes
*/5 * * * * /opt/telegram-bot/scripts/health-check.sh
```

### 3. Set Up Auto-Update

Create update script:

```bash
nano /opt/telegram-bot/scripts/update.sh
```

```bash
#!/bin/bash

cd /opt/telegram-bot

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

echo "Bot updated successfully"
```

Make executable:

```bash
chmod +x /opt/telegram-bot/scripts/update.sh
```

## SSL/HTTPS Setup (Optional)

If you want to set up a webhook (not needed for polling mode):

### 1. Install Nginx

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/telegram-bot
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site and SSL

```bash
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### Common Issues

1. **Container won't start:**
   ```bash
   docker-compose logs
   # Check for missing environment variables
   ```

2. **Bot not responding:**
   ```bash
   # Test connections
   docker-compose exec telegram-bot npm run test:connection
   ```

3. **High memory usage:**
   ```bash
   # Add memory limits to docker-compose.yml
   environment:
     - NODE_OPTIONS=--max-old-space-size=512
   ```

4. **Logs are too large:**
   ```bash
   # Clean up logs
   docker-compose logs --tail=100
   docker system prune -f
   ```

### Useful Commands

```bash
# View real-time logs
docker-compose logs -f

# Restart bot
docker-compose restart

# Update bot
docker-compose down && docker-compose up -d --build

# Check resource usage
docker stats

# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

## Security Considerations

1. **Firewall Setup:**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   docker-compose pull
   ```

3. **Backup Strategy:**
   ```bash
   # Backup configuration
   tar -czf backup-$(date +%Y%m%d).tar.gz .env logs/
   ```

## Monitoring and Alerts

### Set Up Telegram Notifications

Add to your bot's system prompt:

```typescript
// Add admin notification for errors
if (error) {
  await bot.telegram.sendMessage(ADMIN_CHAT_ID, `Bot error: ${error.message}`);
}
```

### Resource Monitoring

```bash
# Monitor disk usage
df -h

# Monitor memory usage
free -h

# Monitor Docker containers
docker stats --no-stream
```

## Performance Tuning

### Docker Compose Optimizations

Update your `docker-compose.yml`:

```yaml
services:
  telegram-bot:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Node.js Optimizations

Add to your environment:

```env
NODE_OPTIONS=--max-old-space-size=512
```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Check logs for errors
   - Monitor resource usage
   - Backup configuration

2. **Monthly:**
   - Update system packages
   - Update Docker images
   - Review and rotate logs

3. **Quarterly:**
   - Security audit
   - Performance review
   - Update dependencies

### Update Process

```bash
# 1. Backup current version
cp -r /opt/telegram-bot /opt/telegram-bot-backup-$(date +%Y%m%d)

# 2. Pull latest changes
cd /opt/telegram-bot
git pull origin main

# 3. Update dependencies
docker-compose down
docker-compose up -d --build

# 4. Test functionality
# Send a test message to your bot

# 5. If everything works, clean up backup
# rm -rf /opt/telegram-bot-backup-*
```

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Test connections: `npm run test:connection`
3. Verify environment variables
4. Check server resources
5. Review the troubleshooting section above

For additional help, check the main [README.md](README.md) or open an issue on GitHub. 