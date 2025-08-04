# Deployment Checklist

Use this checklist to ensure your Telegram bot is properly deployed and configured.

## Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Telegram bot token obtained from [@BotFather](https://t.me/botfather)
- [ ] OpenAI API key obtained from [OpenAI Platform](https://platform.openai.com/)
- [ ] `.env` file created and configured
- [ ] Environment variables validated

### ✅ Local Testing
- [ ] Bot builds successfully: `npm run build`
- [ ] Connection test passes: `npm run test:connection`
- [ ] Formatting test passes: `node scripts/test-formatting.js`
- [ ] Local Docker deployment works: `docker-compose up -d`

## Server Deployment Checklist

### ✅ Server Preparation
- [ ] Server has Ubuntu 20.04+ or similar Linux distribution
- [ ] Server has at least 1GB RAM available
- [ ] SSH access configured with key-based authentication
- [ ] Firewall configured (SSH, HTTP, HTTPS ports open)

### ✅ Server Setup
- [ ] Docker installed and working
- [ ] Docker Compose installed and working
- [ ] Project directory created (`/opt/telegram-bot`)
- [ ] Log directory created (`/opt/telegram-bot/logs`)
- [ ] Health check cron job configured
- [ ] Log rotation configured

### ✅ Code Deployment
- [ ] All project files uploaded to server
- [ ] `.env` file uploaded with correct credentials
- [ ] Docker image built successfully
- [ ] Container starts without errors
- [ ] Bot responds to `/start` command

### ✅ Production Configuration
- [ ] Using production docker-compose file (`docker-compose.prod.yml`)
- [ ] Resource limits configured (memory, CPU)
- [ ] Log file size limits configured
- [ ] Health checks enabled
- [ ] Auto-restart policy configured

## Post-Deployment Checklist

### ✅ Functionality Testing
- [ ] Bot responds to `/start` command
- [ ] Bot responds to `/help` command
- [ ] Bot responds to `/status` command
- [ ] Bot responds to `/clear` command
- [ ] Bot generates AI responses to questions
- [ ] Markdown formatting works correctly
- [ ] Conversation memory works

### ✅ Monitoring Setup
- [ ] Log files are being created
- [ ] Health check script is running
- [ ] Monitoring dashboard accessible
- [ ] Error notifications configured (optional)
- [ ] Resource usage within limits

### ✅ Security Checklist
- [ ] `.env` file not committed to version control
- [ ] Server firewall enabled
- [ ] SSH key-based authentication only
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented

## Maintenance Checklist

### ✅ Daily (Automated)
- [ ] Health checks running every 5 minutes
- [ ] Log rotation working
- [ ] Container restarting automatically if needed

### ✅ Weekly
- [ ] Check logs for errors
- [ ] Monitor resource usage
- [ ] Backup configuration files
- [ ] Review bot performance

### ✅ Monthly
- [ ] Update system packages
- [ ] Update Docker images
- [ ] Review and clean old logs
- [ ] Check for bot updates

### ✅ Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Update dependencies
- [ ] Review backup strategy

## Troubleshooting Quick Reference

### Bot Not Responding
1. Check container status: `docker-compose ps`
2. View logs: `docker-compose logs -f`
3. Test connections: `npm run test:connection`
4. Check environment variables
5. Restart container: `docker-compose restart`

### High Resource Usage
1. Check memory usage: `docker stats`
2. Review log file sizes
3. Adjust resource limits in docker-compose.yml
4. Clean up old containers: `docker system prune`

### Deployment Issues
1. Verify SSH access to server
2. Check server has enough disk space
3. Ensure Docker is installed and running
4. Verify all files uploaded correctly
5. Check firewall settings

### Update Process
1. Backup current version
2. Pull latest changes: `git pull origin main`
3. Rebuild container: `docker-compose up -d --build`
4. Test functionality
5. Monitor for errors

## Useful Commands

```bash
# View real-time logs
docker-compose logs -f

# Check container status
docker-compose ps

# Restart bot
docker-compose restart

# Update bot
./scripts/update.sh

# Monitor resources
./scripts/monitor.sh

# Test connections
npm run test:connection

# Check formatting
node scripts/test-formatting.js
```

## Emergency Procedures

### Bot Down
1. SSH to server
2. Check container: `docker-compose ps`
3. View logs: `docker-compose logs`
4. Restart: `docker-compose up -d`
5. Test: Send message to bot

### Server Issues
1. Check server resources: `htop`, `df -h`
2. Restart Docker: `sudo systemctl restart docker`
3. Rebuild container: `docker-compose up -d --build`
4. Check network: `ping api.telegram.org`

### Data Loss
1. Check backups in `/opt/telegram-bot-backup-*`
2. Restore from backup if needed
3. Reconfigure environment variables
4. Restart services

## Support Contacts

- **GitHub Issues**: For code-related problems
- **Telegram Bot**: For bot-specific issues
- **Server Provider**: For server/hosting issues
- **OpenAI Support**: For API-related issues

---

**Remember**: Always test changes in a development environment before deploying to production! 