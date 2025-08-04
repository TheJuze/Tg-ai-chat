#!/bin/bash

# Remote Deployment Script for Telegram AI Bot
set -e

# Configuration
SERVER_USER="root"
SERVER_HOST="194.58.44.216"
SERVER_PATH="/opt/telegram-bot"
LOCAL_PATH="."

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
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Check if required parameters are provided
if [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ]; then
    print_error "Please configure SERVER_USER and SERVER_HOST variables in this script"
    echo ""
    echo "Edit this script and set:"
    echo "SERVER_USER=\"your-username\""
    echo "SERVER_HOST=\"your-server-ip-or-domain\""
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please copy env.example to .env and configure your settings first."
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found!"
    echo "Please make sure you're in the project directory."
    exit 1
fi

print_header "Starting remote deployment to $SERVER_USER@$SERVER_HOST"

# Test SSH connection
print_status "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
    print_error "Cannot connect to server via SSH"
    echo "Please check:"
    echo "1. Server is accessible"
    echo "2. SSH key is configured"
    echo "3. User has access to the server"
    exit 1
fi

print_status "SSH connection successful"

# Check if server setup is needed
print_status "Checking server setup..."
if ! ssh "$SERVER_USER@$SERVER_HOST" "command -v docker >/dev/null 2>&1"; then
    print_warning "Docker not found on server. Running server setup..."
    ssh "$SERVER_USER@$SERVER_HOST" "bash -s" < scripts/server-setup.sh
    print_warning "Please logout and login to the server for Docker group changes to take effect"
    print_warning "Then run this deployment script again"
    exit 1
fi

# Create remote directory if it doesn't exist
print_status "Creating remote directory..."
ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_PATH"

# Upload files
print_status "Uploading files to server..."
rsync -avz --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'logs' \
    --exclude '*.log' \
    "$LOCAL_PATH/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"

# Upload .env file separately (if it exists)
if [ -f ".env" ]; then
    print_status "Uploading environment configuration..."
    scp .env "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
fi

# Create logs directory on server
print_status "Creating logs directory..."
ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_PATH/logs"

# Build and start the container
print_status "Building and starting container on server..."
ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose up -d --build"

# Wait a moment for the container to start
sleep 5

# Check if container is running
print_status "Checking container status..."
if ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose ps | grep -q 'Up'"; then
    print_status "✅ Bot deployed successfully!"
    echo ""
    print_status "Container status:"
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose ps"
    echo ""
    print_status "Recent logs:"
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose logs --tail=20"
    echo ""
    print_status "Useful commands:"
    echo "  View logs: ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && docker-compose logs -f'"
    echo "  Restart:   ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && docker-compose restart'"
    echo "  Stop:      ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && docker-compose down'"
    echo "  Update:    ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && ./scripts/update.sh'"
    echo ""
    print_status "Test your bot on Telegram now!"
else
    print_error "❌ Container failed to start!"
    echo ""
    print_status "Checking logs for errors:"
    ssh "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose logs"
    echo ""
    print_error "Please check the logs above and fix any issues"
    exit 1
fi 
