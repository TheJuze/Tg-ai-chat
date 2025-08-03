#!/bin/bash

# Telegram AI Bot Deployment Script
set -e

echo "🚀 Starting Telegram AI Bot deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.example to .env and configure your settings."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed!"
    echo "Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build and start the container
echo "📦 Building and starting container..."
docker-compose up -d --build

# Wait a moment for the container to start
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Bot is running successfully!"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📋 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "🔄 To restart: docker-compose restart"
else
    echo "❌ Error: Container failed to start!"
    echo "📋 Check logs: docker-compose logs"
    exit 1
fi 