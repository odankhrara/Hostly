#!/bin/bash

# Kubernetes deployment script

set -e

echo "☸️  Deploying Hostly to Kubernetes..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${YELLOW}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if namespace exists
if kubectl get namespace hostly &> /dev/null; then
    echo -e "${YELLOW}Namespace 'hostly' already exists${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Apply all manifests
echo -e "${BLUE}Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

echo -e "${BLUE}Creating ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml

echo -e "${BLUE}Creating Secrets...${NC}"
echo -e "${YELLOW}⚠️  Make sure to update secrets.yaml with your actual values!${NC}"
kubectl apply -f k8s/secrets.yaml

echo -e "${BLUE}Deploying MySQL...${NC}"
kubectl apply -f k8s/mysql-deployment.yaml

echo -e "${BLUE}Waiting for MySQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=mysql -n hostly --timeout=120s

echo -e "${BLUE}Deploying Backend...${NC}"
kubectl apply -f k8s/backend-deployment.yaml

echo -e "${BLUE}Deploying Agent Service...${NC}"
kubectl apply -f k8s/agent-deployment.yaml

echo -e "${BLUE}Deploying Frontend...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml

echo -e "${BLUE}Creating Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Check status with:"
echo "  kubectl get all -n hostly"
echo ""
echo "View logs with:"
echo "  kubectl logs -f deployment/backend -n hostly"
echo "  kubectl logs -f deployment/agent-service -n hostly"
echo "  kubectl logs -f deployment/frontend -n hostly"
echo ""
echo "Port forward to access services:"
echo "  kubectl port-forward svc/frontend 5173:80 -n hostly"
echo "  kubectl port-forward svc/backend 3000:3000 -n hostly"
echo "  kubectl port-forward svc/agent-service 8000:8000 -n hostly"

