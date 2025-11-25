#!/bin/bash

# Complete EC2 Deployment Script - Pulls from GitHub and Deploys
# Run this script directly on your EC2 instance

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
EC2_PUBLIC_IP="18.218.47.142"
GITHUB_REPO_URL=""  # Will be prompted if not set
GITHUB_BRANCH="aws"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Hostly EC2 Complete Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Update system
echo -e "${BLUE}[1/10] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install required packages
echo -e "${BLUE}[2/10] Installing required packages...${NC}"
sudo apt install -y \
    git \
    curl \
    wget \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    netcat-openbsd \
    openssl
echo -e "${GREEN}✓ Packages installed${NC}"
echo ""

# Step 3: Install Docker
echo -e "${BLUE}[3/10] Installing Docker...${NC}"
if command_exists docker; then
    echo -e "${YELLOW}Docker already installed${NC}"
    docker --version
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
    docker --version
fi
echo ""

# Step 4: Add user to docker group
echo -e "${BLUE}[4/10] Configuring Docker permissions...${NC}"
if groups | grep -q docker; then
    echo -e "${YELLOW}User already in docker group${NC}"
else
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ User added to docker group${NC}"
    echo -e "${YELLOW}Note: You may need to run 'newgrp docker' or reconnect${NC}"
    newgrp docker <<EOF
# Continue in new shell with docker group
EOF
fi
echo ""

# Step 5: Install Docker Compose
echo -e "${BLUE}[5/10] Installing Docker Compose...${NC}"
if docker compose version &> /dev/null || command_exists docker-compose; then
    echo -e "${YELLOW}Docker Compose already installed${NC}"
    docker compose version || docker-compose --version
else
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
    docker compose version
fi
echo ""

# Step 6: Get GitHub repository URL
echo -e "${BLUE}[6/10] Setting up repository...${NC}"
if [ -z "$GITHUB_REPO_URL" ]; then
    echo -e "${YELLOW}Please enter your GitHub repository URL:${NC}"
    echo -e "${YELLOW}Example: https://github.com/username/Hostly.git${NC}"
    read -p "GitHub URL: " GITHUB_REPO_URL
fi

# Step 7: Clone or update repository
if [ -d "Hostly" ]; then
    echo -e "${YELLOW}Hostly directory exists. Updating...${NC}"
    cd Hostly
    git fetch origin
    git checkout $GITHUB_BRANCH 2>/dev/null || git checkout -b $GITHUB_BRANCH origin/$GITHUB_BRANCH
    git pull origin $GITHUB_BRANCH || echo -e "${YELLOW}Pull failed, continuing with existing code...${NC}"
    cd ..
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone -b $GITHUB_BRANCH "$GITHUB_REPO_URL" Hostly || git clone "$GITHUB_REPO_URL" Hostly
    echo -e "${GREEN}✓ Repository cloned${NC}"
fi
echo ""

# Step 8: Navigate to project directory
cd Hostly
echo -e "${BLUE}[7/10] Setting up project...${NC}"

# Create necessary directories
mkdir -p backend/uploads backend/logs
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 9: Create .env file if it doesn't exist
echo -e "${BLUE}[8/10] Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    
    # Generate secure passwords
    MONGODB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    # Prompt for API keys
    echo ""
    echo -e "${YELLOW}Please enter your API keys (press Enter to skip and add later):${NC}"
    read -p "OPENAI_API_KEY: " OPENAI_API_KEY
    read -p "TAVILY_API_KEY: " TAVILY_API_KEY
    
    # Use defaults if empty
    OPENAI_API_KEY=${OPENAI_API_KEY:-"YOUR_OPENAI_API_KEY_HERE"}
    TAVILY_API_KEY=${TAVILY_API_KEY:-"YOUR_TAVILY_API_KEY_HERE"}
    
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
else
    echo -e "${YELLOW}.env file already exists, skipping...${NC}"
fi
echo ""

# Step 10: Update docker-compose.yml with EC2 IP
echo -e "${BLUE}[9/10] Updating docker-compose.yml...${NC}"
if [ -f "docker-compose.yml" ]; then
    # Create backup
    cp docker-compose.yml docker-compose.yml.backup 2>/dev/null || true
    
    # Update CORS_ORIGIN
    sed -i "s|CORS_ORIGIN: http://localhost:5173|CORS_ORIGIN: http://${EC2_PUBLIC_IP}:5173|g" docker-compose.yml
    
    # Update VITE_API_BASE_URL
    sed -i "s|VITE_API_BASE_URL: http://localhost:3000/api|VITE_API_BASE_URL: http://${EC2_PUBLIC_IP}:3000/api|g" docker-compose.yml
    
    # Update FRONTEND_URL
    sed -i "s|FRONTEND_URL: http://localhost:5173|FRONTEND_URL: http://${EC2_PUBLIC_IP}:5173|g" docker-compose.yml
    
    # Update BACKEND_URL (be careful with this one)
    sed -i "s|BACKEND_URL: http://backend:3000|BACKEND_URL: http://${EC2_PUBLIC_IP}:3000|g" docker-compose.yml
    
    echo -e "${GREEN}✓ docker-compose.yml updated${NC}"
else
    echo -e "${RED}Error: docker-compose.yml not found${NC}"
    exit 1
fi
echo ""

# Step 11: Deploy application
echo -e "${BLUE}[10/10] Deploying application...${NC}"
echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker compose down 2>/dev/null || true

echo -e "${YELLOW}Building Docker images (this may take several minutes)...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}Starting all services...${NC}"
docker compose up -d

echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for services
echo -e "${YELLOW}Waiting for services to be ready (30 seconds)...${NC}"
sleep 30

# Show status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Container Status:${NC}"
docker compose ps
echo ""

echo -e "${GREEN}Your application is now live at:${NC}"
echo "  Frontend:    http://${EC2_PUBLIC_IP}:5173"
echo "  Backend API: http://${EC2_PUBLIC_IP}:3000/api"
echo "  Agent Docs:  http://${EC2_PUBLIC_IP}:8000/docs"
echo "  Mongo Express: http://${EC2_PUBLIC_IP}:8081"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:        docker compose logs -f"
echo "  View backend:     docker compose logs -f backend"
echo "  Restart service:  docker compose restart backend"
echo "  Stop all:         docker compose down"
echo "  Check status:     docker compose ps"
echo ""
echo -e "${YELLOW}Note: It may take 2-3 minutes for all services to be fully ready${NC}"
echo ""

