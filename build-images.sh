#!/bin/bash

# Build script for all Docker images

set -e

echo "🐳 Building Hostly Docker Images..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build Backend
echo -e "${BLUE}Building Backend image...${NC}"
cd backend
docker build -t hostly-backend:latest .
echo -e "${GREEN}✓ Backend image built${NC}"
cd ..

# Build Frontend
echo -e "${BLUE}Building Frontend image...${NC}"
cd frontend
docker build -t hostly-frontend:latest .
echo -e "${GREEN}✓ Frontend image built${NC}"
cd ..

# Build Agent Service
echo -e "${BLUE}Building Agent Service image...${NC}"
cd agent-service
docker build -t hostly-agent:latest .
echo -e "${GREEN}✓ Agent Service image built${NC}"
cd ..

echo ""
echo -e "${GREEN}✅ All images built successfully!${NC}"
echo ""
echo "Images created:"
echo "  - hostly-backend:latest"
echo "  - hostly-frontend:latest"
echo "  - hostly-agent:latest"
echo ""
echo "To push to registry:"
echo "  docker tag hostly-backend:latest yourusername/hostly-backend:latest"
echo "  docker push yourusername/hostly-backend:latest"

