#!/bin/bash

# Monitoring Script for Telegram AI Bot
set -e

BOT_DIR="/opt/telegram-bot"
LOG_FILE="$BOT_DIR/logs/monitor.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[MONITOR]${NC} $1"
}

# Log function
log_message() {
    echo "$(date): $1" >> "$LOG_FILE"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    if [ -d "$BOT_DIR" ]; then
        cd "$BOT_DIR"
    else
        print_error "Bot directory not found. Please run this script from the bot directory."
        exit 1
    fi
fi

print_header "Telegram Bot Monitoring Dashboard"
echo "======================================"

# Check container status
print_status "Container Status:"
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Bot container is running"
    log_message "Container status check: RUNNING"
else
    print_error "❌ Bot container is not running"
    log_message "Container status check: STOPPED"
fi

# Check resource usage
print_status "Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Check disk usage
print_status "Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

# Check log file sizes
print_status "Log File Sizes:"
if [ -d "logs" ]; then
    ls -lh logs/ 2>/dev/null || echo "No logs directory found"
else
    echo "No logs directory found"
fi

# Check recent errors
print_status "Recent Errors (last 10):"
if [ -f "logs/error.log" ]; then
    tail -10 logs/error.log 2>/dev/null || echo "No error logs found"
else
    echo "No error log file found"
fi

# Check bot uptime
print_status "Bot Uptime:"
if docker-compose ps | grep -q "Up"; then
    UPTIME=$(docker-compose ps | grep "Up" | awk '{print $4}')
    echo "Container uptime: $UPTIME"
else
    echo "Container is not running"
fi

# Check memory usage
print_status "Memory Usage:"
free -h

# Check network connectivity
print_status "Network Connectivity:"
if ping -c 1 api.telegram.org >/dev/null 2>&1; then
    print_status "✅ Telegram API: Reachable"
else
    print_error "❌ Telegram API: Unreachable"
fi

if ping -c 1 api.openai.com >/dev/null 2>&1; then
    print_status "✅ OpenAI API: Reachable"
else
    print_error "❌ OpenAI API: Unreachable"
fi

# Check for updates
print_status "Update Check:"
if [ -d ".git" ]; then
    git fetch origin >/dev/null 2>&1
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    if [ "$LOCAL" = "$REMOTE" ]; then
        print_status "✅ Bot is up to date"
    else
        print_warning "⚠️  Updates available"
        echo "Run: ./scripts/update.sh to update"
    fi
else
    echo "Not a git repository"
fi

# Check cron jobs
print_status "Cron Jobs:"
if crontab -l 2>/dev/null | grep -q "health-check"; then
    print_status "✅ Health check cron job is configured"
else
    print_warning "⚠️  Health check cron job not found"
fi

echo ""
print_status "Quick Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart:   docker-compose restart"
echo "  Update:    ./scripts/update.sh"
echo "  Stop:      docker-compose down"
echo "  Start:     docker-compose up -d"

# Log monitoring completion
log_message "Monitoring check completed" 