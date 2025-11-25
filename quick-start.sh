#!/bin/bash

# Quick Start Script - Does everything in one go
# Run this after connecting to EC2

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

EC2_PUBLIC_IP="18.218.47.142"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Hostly Quick Start Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if scripts exist
if [ ! -f "ec2-setup.sh" ]; then
    echo -e "${YELLOW}Scripts not found. Please upload them first or clone from GitHub.${NC}"
    exit 1
fi

# Step 1: Run setup
echo -e "${YELLOW}[Step 1/4] Running initial setup...${NC}"
chmod +x ec2-setup.sh
./ec2-setup.sh

# Step 2: Setup environment
echo ""
echo -e "${YELLOW}[Step 2/4] Setting up environment...${NC}"
if [ -d "Hostly" ]; then
    cd Hostly
fi
chmod +x setup-env.sh
./setup-env.sh

# Step 3: Update docker-compose
echo ""
echo -e "${YELLOW}[Step 3/4] Updating docker-compose.yml...${NC}"
chmod +x update-docker-compose.sh
./update-docker-compose.sh

# Step 4: Deploy
echo ""
echo -e "${YELLOW}[Step 4/4] Deploying application...${NC}"
chmod +x deploy.sh
./deploy.sh

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All Done! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your application is live at:"
echo "  Frontend: http://${EC2_PUBLIC_IP}:5173"
echo "  Backend: http://${EC2_PUBLIC_IP}:3000/api"
echo "  Agent: http://${EC2_PUBLIC_IP}:8000/docs"
echo ""

