#!/bin/bash

# EC2 Setup Script for Hostly Application
# This script installs all required dependencies and sets up the environment

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 Public IP (update this if needed)
EC2_PUBLIC_IP="18.218.47.142"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Hostly EC2 Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

# Step 1: Update system packages
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install required packages
echo -e "${YELLOW}[2/8] Installing required packages (Git, curl, etc.)...${NC}"
sudo apt install -y \
    git \
    curl \
    wget \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    netcat-openbsd
echo -e "${GREEN}✓ Packages installed${NC}"
echo ""

# Step 3: Install Docker
echo -e "${YELLOW}[3/8] Installing Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}Docker is already installed${NC}"
    docker --version
else
    # Install Docker using official script
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
    docker --version
fi
echo ""

# Step 4: Add user to docker group
echo -e "${YELLOW}[4/8] Adding user to docker group...${NC}"
sudo usermod -aG docker $USER
echo -e "${GREEN}✓ User added to docker group${NC}"
echo -e "${YELLOW}Note: You may need to log out and back in for this to take effect${NC}"
echo ""

# Step 5: Install Docker Compose
echo -e "${YELLOW}[5/8] Installing Docker Compose...${NC}"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}Docker Compose is already installed${NC}"
    docker compose version || docker-compose --version
else
    # Install Docker Compose
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
    docker compose version
fi
echo ""

# Step 6: Clone repository (or check if already exists)
echo -e "${YELLOW}[6/8] Setting up repository...${NC}"
if [ -d "Hostly" ]; then
    echo -e "${YELLOW}Hostly directory already exists. Pulling latest changes...${NC}"
    cd Hostly
    git pull || echo -e "${YELLOW}Git pull failed, continuing with existing code...${NC}"
    cd ..
else
    echo -e "${YELLOW}Please provide your GitHub repository URL:${NC}"
    echo -e "${YELLOW}Example: https://github.com/username/Hostly.git${NC}"
    read -p "GitHub repository URL (or press Enter to skip): " GITHUB_REPO
    
    if [ -n "$GITHUB_REPO" ]; then
        git clone "$GITHUB_REPO" Hostly
        echo -e "${GREEN}✓ Repository cloned${NC}"
    else
        echo -e "${YELLOW}Repository clone skipped. Please clone manually later.${NC}"
        mkdir -p Hostly
    fi
fi
echo ""

# Step 7: Create necessary directories
echo -e "${YELLOW}[7/8] Creating necessary directories...${NC}"
if [ -d "Hostly" ]; then
    cd Hostly
    mkdir -p backend/uploads backend/logs
    echo -e "${GREEN}✓ Directories created${NC}"
    cd ..
fi
echo ""

# Step 8: Summary and next steps
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. If you logged out for docker group, reconnect:"
echo "   ssh -i hostly-key.pem ec2-user@18.218.47.142"
echo ""
echo "2. Navigate to the project directory:"
echo "   cd ~/Hostly"
echo ""
echo "3. Run the environment setup script:"
echo "   chmod +x setup-env.sh"
echo "   ./setup-env.sh"
echo ""
echo "4. Update docker-compose.yml with your EC2 IP:"
echo "   chmod +x update-docker-compose.sh"
echo "   ./update-docker-compose.sh"
echo ""
echo "5. Deploy the application:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo ""
echo -e "${YELLOW}Note: Make sure to update .env file with your API keys and passwords!${NC}"
echo ""

