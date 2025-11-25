#!/bin/bash

# Environment Setup Script
# Creates .env file with secure passwords and prompts for API keys

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

EC2_PUBLIC_IP="18.218.47.142"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Environment Setup for Hostly${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if in Hostly directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Please run this script from the Hostly directory${NC}"
    exit 1
fi

# Generate secure passwords
echo -e "${YELLOW}Generating secure passwords...${NC}"
MONGODB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SESSION_SECRET=$(openssl rand -hex 32)

echo -e "${GREEN}✓ Passwords generated${NC}"
echo ""

# Prompt for API keys
echo -e "${YELLOW}Please enter your API keys (press Enter to skip and add later):${NC}"
read -p "OPENAI_API_KEY: " OPENAI_API_KEY
read -p "TAVILY_API_KEY: " TAVILY_API_KEY

# Use defaults if empty
OPENAI_API_KEY=${OPENAI_API_KEY:-"YOUR_OPENAI_API_KEY_HERE"}
TAVILY_API_KEY=${TAVILY_API_KEY:-"YOUR_TAVILY_API_KEY_HERE"}

# Create .env file
echo -e "${YELLOW}Creating .env file...${NC}"

cat > .env << EOF
# MongoDB Configuration
MONGODB_DB=hostly
MONGODB_USER=admin
MONGODB_PASSWORD=${MONGODB_PASSWORD}
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_URI=mongodb://admin:${MONGODB_PASSWORD}@localhost:27017/hostly?authSource=admin

# Backend Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=${SESSION_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}
CORS_ORIGIN=http://${EC2_PUBLIC_IP}:5173
KAFKA_BROKER=localhost:9092

# Agent Service Configuration
TAVILY_API_KEY=${TAVILY_API_KEY}
FRONTEND_URL=http://${EC2_PUBLIC_IP}:5173
BACKEND_URL=http://${EC2_PUBLIC_IP}:3000

# Frontend Configuration
VITE_API_BASE_URL=http://${EC2_PUBLIC_IP}:3000/api
EOF

echo -e "${GREEN}✓ .env file created${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Save these credentials securely!${NC}"
echo "MongoDB Password: ${MONGODB_PASSWORD}"
echo "Session Secret: ${SESSION_SECRET}"
echo ""
echo -e "${YELLOW}If you skipped API keys, edit .env file to add them:${NC}"
echo "nano .env"
echo ""

