#!/bin/bash

# Script to create security groups for Hostly EC2 deployment
# Usage: ./create-security-groups.sh <VPC_ID> <YOUR_IP>

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if VPC ID is provided
if [ -z "$1" ]; then
    echo "Usage: ./create-security-groups.sh <VPC_ID> [YOUR_IP]"
    echo "Example: ./create-security-groups.sh vpc-12345678 76.102.15.113/32"
    echo ""
    echo "To find your VPC ID:"
    echo "  aws ec2 describe-vpcs --query 'Vpcs[?IsDefault==\`true\`].VpcId' --output text"
    exit 1
fi

VPC_ID=$1
YOUR_IP=${2:-"76.102.15.113/32"}

echo -e "${GREEN}Creating security groups for Hostly deployment...${NC}"
echo "VPC ID: $VPC_ID"
echo "Your IP: $YOUR_IP"
echo ""

# Create Security Group 1: Application Services
echo -e "${YELLOW}Creating hostly-app-sg (Application Services)...${NC}"
APP_SG_ID=$(aws ec2 create-security-group \
    --group-name hostly-app-sg \
    --description "Security group for Hostly application services (Frontend, Backend, Agent)" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

echo "Created security group: $APP_SG_ID"

# Add rules to Application Security Group
echo "Adding inbound rules to hostly-app-sg..."

# SSH Rule
aws ec2 authorize-security-group-ingress \
    --group-id $APP_SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr $YOUR_IP \
    --description "SSH" > /dev/null

# Backend Rule
aws ec2 authorize-security-group-ingress \
    --group-id $APP_SG_ID \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 \
    --description "Backend" > /dev/null

# Frontend Rule
aws ec2 authorize-security-group-ingress \
    --group-id $APP_SG_ID \
    --protocol tcp \
    --port 5173 \
    --cidr 0.0.0.0/0 \
    --description "Frontend" > /dev/null

# Agent Service Rule
aws ec2 authorize-security-group-ingress \
    --group-id $APP_SG_ID \
    --protocol tcp \
    --port 8000 \
    --cidr 0.0.0.0/0 \
    --description "agent" > /dev/null

echo -e "${GREEN}✓ Application security group created: $APP_SG_ID${NC}"
echo ""

# Create Security Group 2: Database & Infrastructure
echo -e "${YELLOW}Creating hostly-db-sg (Database & Infrastructure)...${NC}"
DB_SG_ID=$(aws ec2 create-security-group \
    --group-name hostly-db-sg \
    --description "Security group for Hostly database and infrastructure services" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

echo "Created security group: $DB_SG_ID"

# Add rules to Database Security Group
echo "Adding inbound rules to hostly-db-sg..."

# MongoDB Rule
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 27017 \
    --cidr 0.0.0.0/0 \
    --description "mongodb" > /dev/null

# Kafka Rule
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 9092 \
    --cidr 0.0.0.0/0 \
    --description "kafka" > /dev/null

# Mongo Express Rule
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 8081 \
    --cidr 0.0.0.0/0 \
    --description "mongo-express" > /dev/null

# Zookeeper Rule
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 2181 \
    --cidr 0.0.0.0/0 \
    --description "zookeeper" > /dev/null

echo -e "${GREEN}✓ Database security group created: $DB_SG_ID${NC}"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Security Groups Created Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application Security Group (hostly-app-sg):"
echo "  ID: $APP_SG_ID"
echo "  Rules: SSH (22), Backend (3000), Frontend (5173), Agent (8000)"
echo ""
echo "Database Security Group (hostly-db-sg):"
echo "  ID: $DB_SG_ID"
echo "  Rules: MongoDB (27017), Kafka (9092), Mongo Express (8081), Zookeeper (2181)"
echo ""
echo "Next steps:"
echo "  1. Launch EC2 instance and attach both security groups"
echo "  2. Use these security group IDs when launching your instance"
echo ""
echo "To view security groups:"
echo "  aws ec2 describe-security-groups --group-ids $APP_SG_ID $DB_SG_ID"
echo ""

