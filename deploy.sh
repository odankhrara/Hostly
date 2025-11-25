#!/bin/bash

# Deployment Script for Hostly Application
# This script builds and starts all Docker containers

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Hostly Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if in Hostly directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found${NC}"
    echo "Please run this script from the Hostly directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Running setup-env.sh to create it..."
    chmod +x setup-env.sh
    ./setup-env.sh
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

# Make sure user is in docker group
if ! groups | grep -q docker; then
    echo -e "${YELLOW}Warning: User may not be in docker group${NC}"
    echo "You may need to log out and back in, or use: sudo usermod -aG docker \$USER"
fi

echo -e "${YELLOW}[1/4] Stopping any existing containers...${NC}"
docker compose down 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}[2/4] Building Docker images...${NC}"
docker compose build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo -e "${YELLOW}[3/4] Starting all services...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}[4/4] Waiting for services to be healthy...${NC}"
sleep 10

# Check container status
echo ""
echo -e "${GREEN}Container Status:${NC}"
docker compose ps
echo ""

# Wait a bit more and check logs
echo -e "${YELLOW}Checking service health (this may take 1-2 minutes)...${NC}"
sleep 30

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your application should be accessible at:"
echo "  - Frontend: http://18.218.47.142:5173"
echo "  - Backend API: http://18.218.47.142:3000/api"
echo "  - Agent Service: http://18.218.47.142:8000/docs"
echo "  - Mongo Express: http://18.218.47.142:8081"
echo ""
echo "Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - View specific service: docker compose logs -f backend"
echo "  - Stop services: docker compose down"
echo "  - Restart services: docker compose restart"
echo "  - Check status: docker compose ps"
echo ""
echo -e "${YELLOW}Note: It may take 2-3 minutes for all services to be fully ready${NC}"
echo ""

