#!/bin/bash

# Update docker-compose.yml with EC2 Public IP

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

EC2_PUBLIC_IP="18.218.47.142"

echo -e "${GREEN}Updating docker-compose.yml with EC2 IP: ${EC2_PUBLIC_IP}${NC}"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Error: docker-compose.yml not found${NC}"
    echo "Please run this script from the Hostly directory"
    exit 1
fi

# Create backup
cp docker-compose.yml docker-compose.yml.backup
echo -e "${GREEN}✓ Backup created: docker-compose.yml.backup${NC}"

# Update CORS_ORIGIN in backend service
sed -i "s|CORS_ORIGIN: http://localhost:5173|CORS_ORIGIN: http://${EC2_PUBLIC_IP}:5173|g" docker-compose.yml

# Update VITE_API_BASE_URL in frontend service
sed -i "s|VITE_API_BASE_URL: http://localhost:3000/api|VITE_API_BASE_URL: http://${EC2_PUBLIC_IP}:3000/api|g" docker-compose.yml

# Update FRONTEND_URL in agent-service
sed -i "s|FRONTEND_URL: http://localhost:5173|FRONTEND_URL: http://${EC2_PUBLIC_IP}:5173|g" docker-compose.yml

# Update BACKEND_URL in agent-service
sed -i "s|BACKEND_URL: http://backend:3000|BACKEND_URL: http://${EC2_PUBLIC_IP}:3000|g" docker-compose.yml

echo -e "${GREEN}✓ docker-compose.yml updated successfully${NC}"
echo ""
echo "Updated values:"
echo "  - CORS_ORIGIN: http://${EC2_PUBLIC_IP}:5173"
echo "  - VITE_API_BASE_URL: http://${EC2_PUBLIC_IP}:3000/api"
echo "  - FRONTEND_URL: http://${EC2_PUBLIC_IP}:5173"
echo "  - BACKEND_URL: http://${EC2_PUBLIC_IP}:3000"
echo ""

