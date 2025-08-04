#!/bin/bash

# Server Setup Script for Telegram AI Bot
set -e

echo "🚀 Setting up server for Telegram AI Bot..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nano htop ufw

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_status "Docker installed successfully"
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose is already installed"
fi

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p /opt/telegram-bot
sudo chown $USER:$USER /opt/telegram-bot

# Set up firewall
print_status "Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create log directory
print_status "Creating log directory..."
mkdir -p /opt/telegram-bot/logs

# Create health check script
print_status "Creating health check script..."
cat > /opt/telegram-bot/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for Telegram bot
BOT_DIR="/opt/telegram-bot"
LOG_FILE="$BOT_DIR/logs/health-check.log"

# Check if container is running
if ! docker-compose -f $BOT_DIR/docker-compose.yml ps | grep -q "Up"; then
    echo "$(date): Bot is down, restarting..." >> $LOG_FILE
    cd $BOT_DIR
    docker-compose up -d
    echo "$(date): Bot restarted" >> $LOG_FILE
else
    echo "$(date): Bot is running" >> $LOG_FILE
fi
EOF

chmod +x /opt/telegram-bot/scripts/health-check.sh

# Create update script
print_status "Creating update script..."
cat > /opt/telegram-bot/scripts/update.sh << 'EOF'
#!/bin/bash

# Update script for Telegram bot
BOT_DIR="/opt/telegram-bot"
LOG_FILE="$BOT_DIR/logs/update.log"

echo "$(date): Starting bot update..." >> $LOG_FILE

cd $BOT_DIR

# Backup current version
cp -r $BOT_DIR $BOT_DIR-backup-$(date +%Y%m%d-%H%M%S)

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    git pull origin main
fi

# Rebuild and restart
docker-compose down
docker-compose up -d --build

echo "$(date): Bot updated successfully" >> $LOG_FILE
EOF

chmod +x /opt/telegram-bot/scripts/update.sh

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/telegram-bot > /dev/null << 'EOF'
/opt/telegram-bot/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /opt/telegram-bot/docker-compose.yml restart telegram-bot
    endscript
}
EOF

# Add health check to crontab
print_status "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/telegram-bot/scripts/health-check.sh") | crontab -

print_status "Server setup completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Upload your bot code to /opt/telegram-bot/"
echo "2. Copy env.example to .env and configure your settings"
echo "3. Run: docker-compose up -d --build"
echo "4. Test your bot on Telegram"
echo ""
print_warning "Please logout and login again for Docker group changes to take effect" 