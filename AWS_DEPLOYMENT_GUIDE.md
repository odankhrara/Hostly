# AWS Deployment Guide for Hostly

This guide provides step-by-step instructions for deploying the Hostly application to AWS. We'll cover multiple deployment options from simplest to most scalable.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Services Overview](#aws-services-overview)
3. [Deployment Options](#deployment-options)
4. [Option 1: ECS (Elastic Container Service) - Recommended for Start](#option-1-ecs-elastic-container-service---recommended-for-start)
5. [Option 2: EKS (Elastic Kubernetes Service) - Production Ready](#option-2-eks-elastic-kubernetes-service---production-ready)
6. [Option 3: EC2 with Docker Compose - Quick Start](#option-3-ec2-with-docker-compose---quick-start)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Cost Optimization Tips](#cost-optimization-tips)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. AWS Account Setup
- **Create AWS Account**: Go to [aws.amazon.com](https://aws.amazon.com) and sign up
- **Enable MFA**: Set up Multi-Factor Authentication for security
- **Create IAM User**: Don't use root account for deployments
  - Go to **IAM Console** → **Users** → **Add users**
  - Enable **Programmatic access** and **AWS Management Console access**
  - Attach policy: `PowerUserAccess` (or create custom policy with required permissions)
  - **Save Access Key ID and Secret Access Key** securely

### 2. Install Required Tools
```bash
# AWS CLI
# Windows (PowerShell)
winget install Amazon.AWSCLI

# Or download from: https://aws.amazon.com/cli/

# Docker Desktop (if not installed)
# Download from: https://www.docker.com/products/docker-desktop

# kubectl (for EKS option)
# Windows
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/
```

### 3. Configure AWS CLI
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

### 4. Verify Setup
```bash
aws sts get-caller-identity
# Should display your AWS account details
```

---

## AWS Services Overview

### Services We'll Use:
- **EC2**: Virtual servers for hosting containers
- **ECS**: Container orchestration service (simpler than Kubernetes)
- **EKS**: Managed Kubernetes service (more scalable)
- **ECR**: Container registry for Docker images
- **Application Load Balancer (ALB)**: Distribute traffic to services
- **Route 53**: DNS management (optional)
- **CloudWatch**: Monitoring and logging
- **VPC**: Virtual network for your resources
- **Security Groups**: Firewall rules
- **IAM**: Access management

### Managed Services (Recommended):
- **Amazon DocumentDB**: Managed MongoDB (alternative to self-hosted)
- **Amazon MSK**: Managed Kafka (alternative to self-hosted)
- **Amazon RDS**: Managed MySQL/PostgreSQL (if needed)

---

## Deployment Options

### Quick Comparison:

| Option | Complexity | Scalability | Cost | Best For | Time to Deploy |
|--------|-----------|-------------|------|----------|----------------|
| **EC2 + Docker Compose** | ⭐ Low | ⭐⭐ Medium | $ | **Learning, projects, demos** | **30-60 min** ⭐ EASIEST |
| ECS | ⭐⭐ Medium | ⭐⭐⭐ High | $$ | Most projects, production | 2-4 hours |
| EKS | ⭐⭐⭐ High | ⭐⭐⭐⭐ Very High | $$$ | Large scale, enterprise | 4-6 hours |

### 🎯 **RECOMMENDATION FOR YOUR PROJECT:**

**Choose Option 3: EC2 with Docker Compose** because:
- ✅ You already have `docker-compose.yml` working locally
- ✅ Minimal changes needed (just update URLs)
- ✅ Same commands you're already using
- ✅ Fastest deployment (30-60 minutes)
- ✅ Perfect for project requirements and demos
- ✅ Easy to troubleshoot (SSH in and check logs)
- ✅ Low cost (~$15-30/month for t3.medium instance)

**If you need something more "production-like" for your project presentation**, then Option 1 (ECS) is a good middle ground, but it requires more setup time.

---

## Option 1: ECS (Elastic Container Service) - Recommended for Start

### Step 1: Create ECR Repositories

1. **Go to ECR Console**: https://console.aws.amazon.com/ecr/
2. **Create repositories** for each service:
   - Click **Create repository**
   - Repository name: `hostly-backend`
   - Visibility: Private
   - Click **Create repository**
   - Repeat for: `hostly-frontend`, `hostly-agent`

### Step 2: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Replace <YOUR_ACCOUNT_ID> with your AWS account ID
# Get account ID: aws sts get-caller-identity --query Account --output text

# Set variables
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_BASE=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push Backend
cd backend
docker build -t hostly-backend .
docker tag hostly-backend:latest $ECR_BASE/hostly-backend:latest
docker push $ECR_BASE/hostly-backend:latest
cd ..

# Build and push Frontend
cd frontend
docker build -t hostly-frontend .
docker tag hostly-frontend:latest $ECR_BASE/hostly-frontend:latest
docker push $ECR_BASE/hostly-frontend:latest
cd ..

# Build and push Agent Service
cd agent-service
docker build -t hostly-agent .
docker tag hostly-agent:latest $ECR_BASE/hostly-agent:latest
docker push $ECR_BASE/hostly-agent:latest
cd ..
```

### Step 3: Create VPC and Networking

1. **Go to VPC Console**: https://console.aws.amazon.com/vpc/
2. **Create VPC**:
   - Click **Create VPC**
   - Name: `hostly-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - Click **Create VPC**

3. **Create Subnets**:
   - Click **Subnets** → **Create subnet**
   - VPC: Select `hostly-vpc`
   - Subnet 1:
     - Name: `hostly-public-1`
     - AZ: `us-east-1a`
     - IPv4 CIDR: `10.0.1.0/24`
   - Subnet 2:
     - Name: `hostly-public-2`
     - AZ: `us-east-1b`
     - IPv4 CIDR: `10.0.2.0/24`
   - Click **Create subnet**

4. **Create Internet Gateway**:
   - Click **Internet Gateways** → **Create internet gateway**
   - Name: `hostly-igw`
   - Click **Create internet gateway**
   - Select it → **Actions** → **Attach to VPC** → Select `hostly-vpc`

5. **Create Route Table**:
   - Click **Route Tables** → **Create route table**
   - Name: `hostly-public-rt`
   - VPC: `hostly-vpc`
   - Click **Create route table**
   - Select it → **Routes** → **Edit routes** → **Add route**
     - Destination: `0.0.0.0/0`
     - Target: Internet Gateway `hostly-igw`
   - **Subnet associations** → **Edit subnet associations** → Select both public subnets

### Step 4: Create Security Groups

1. **Go to EC2 Console** → **Security Groups**
2. **Create Security Groups**:

   **ALB Security Group**:
   - Name: `hostly-alb-sg`
   - Description: `Security group for Application Load Balancer`
   - VPC: `hostly-vpc`
   - Inbound Rules:
     - Type: HTTP, Port: 80, Source: 0.0.0.0/0
     - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
   - Outbound Rules: Allow all

   **ECS Security Group**:
   - Name: `hostly-ecs-sg`
   - Description: `Security group for ECS tasks`
   - VPC: `hostly-vpc`
   - Inbound Rules:
     - Type: Custom TCP, Port: 3000, Source: `hostly-alb-sg`
     - Type: Custom TCP, Port: 8000, Source: `hostly-alb-sg`
     - Type: Custom TCP, Port: 80, Source: `hostly-alb-sg`
   - Outbound Rules: Allow all

   **MongoDB Security Group**:
   - Name: `hostly-mongodb-sg`
   - Description: `Security group for MongoDB`
   - VPC: `hostly-vpc`
   - Inbound Rules:
     - Type: Custom TCP, Port: 27017, Source: `hostly-ecs-sg`
   - Outbound Rules: Allow all

   **Kafka Security Group**:
   - Name: `hostly-kafka-sg`
   - Description: `Security group for Kafka`
   - VPC: `hostly-vpc`
   - Inbound Rules:
     - Type: Custom TCP, Port: 9092, Source: `hostly-ecs-sg`
     - Type: Custom TCP, Port: 2181, Source: `hostly-ecs-sg`
   - Outbound Rules: Allow all

### Step 5: Create ECS Cluster

1. **Go to ECS Console**: https://console.aws.amazon.com/ecs/
2. **Create Cluster**:
   - Click **Create Cluster**
   - Cluster name: `hostly-cluster`
   - Infrastructure: **AWS Fargate** (serverless, no EC2 management)
   - Click **Create**

### Step 6: Create Task Definitions

#### Backend Task Definition

1. **Go to ECS** → **Task Definitions** → **Create new Task Definition**
2. **Configure**:
   - Family: `hostly-backend`
   - Launch type: **Fargate**
   - Task size:
     - CPU: 0.5 vCPU
     - Memory: 1 GB
   - Task role: Create new role (or use existing)
   - Network mode: `awsvpc`

3. **Container Definitions** → **Add container**:
   - Container name: `backend`
   - Image URI: `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/hostly-backend:latest`
   - Port mappings: `3000`
   - Environment variables:
     ```
     NODE_ENV=production
     PORT=3000
     MONGODB_URI=mongodb://<MONGODB_USER>:<MONGODB_PASSWORD>@<MONGODB_HOST>:27017/hostly?authSource=admin
     MONGODB_HOST=<MONGODB_HOST>
     MONGODB_PORT=27017
     MONGODB_DB=hostly
     MONGODB_USER=<MONGODB_USER>
     MONGODB_PASSWORD=<MONGODB_PASSWORD>
     SESSION_SECRET=<GENERATE_SECURE_SECRET>
     OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
     CORS_ORIGIN=https://<YOUR_DOMAIN>
     KAFKA_BROKER=<KAFKA_BROKER_URL>
     ```
   - Click **Add**

4. **Click Create**

#### Frontend Task Definition

1. **Create new Task Definition**:
   - Family: `hostly-frontend`
   - Launch type: **Fargate**
   - Task size: 0.25 vCPU, 0.5 GB
   - Network mode: `awsvpc`

2. **Add container**:
   - Container name: `frontend`
   - Image URI: `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/hostly-frontend:latest`
   - Port mappings: `80`
   - Environment variables:
     ```
     VITE_API_BASE_URL=https://<YOUR_BACKEND_DOMAIN>/api
     ```
   - Click **Create**

#### Agent Service Task Definition

1. **Create new Task Definition**:
   - Family: `hostly-agent`
   - Launch type: **Fargate**
   - Task size: 0.5 vCPU, 1 GB
   - Network mode: `awsvpc`

2. **Add container**:
   - Container name: `agent`
   - Image URI: `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/hostly-agent:latest`
   - Port mappings: `8000`
   - Environment variables: (similar to backend)
   - Click **Create**

### Step 7: Deploy MongoDB (Option A: EC2 Instance)

1. **Launch EC2 Instance**:
   - Go to **EC2 Console** → **Launch Instance**
   - Name: `hostly-mongodb`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: `t3.small` (2 vCPU, 2 GB RAM)
   - Key pair: Create new or select existing
   - Network: `hostly-vpc`
   - Subnet: `hostly-public-1`
   - Auto-assign Public IP: Enable
   - Security group: `hostly-mongodb-sg`
   - Storage: 20 GB gp3
   - Click **Launch Instance**

2. **SSH into instance**:
   ```bash
   ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
   ```

3. **Install Docker and MongoDB**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose

   # Create MongoDB directory
   mkdir -p ~/mongodb-data

   # Run MongoDB
   docker run -d \
     --name mongodb \
     --restart unless-stopped \
     -p 27017:27017 \
     -v ~/mongodb-data:/data/db \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=<SECURE_PASSWORD> \
     mongo:7.0
   ```

### Step 7: Deploy MongoDB (Option B: Amazon DocumentDB - Recommended)

1. **Go to DocumentDB Console**: https://console.aws.amazon.com/docdb/
2. **Create Cluster**:
   - Engine: MongoDB-compatible
   - Cluster identifier: `hostly-db`
   - Master username: `admin`
   - Master password: `<SECURE_PASSWORD>`
   - Instance class: `db.t3.medium`
   - VPC: `hostly-vpc`
   - Subnet group: Create new (select both subnets)
   - Security group: `hostly-mongodb-sg`
   - Click **Create**

### Step 8: Deploy Kafka (Option A: EC2 Instance)

Similar to MongoDB, launch EC2 instance and run Kafka + Zookeeper containers.

### Step 8: Deploy Kafka (Option B: Amazon MSK - Recommended)

1. **Go to MSK Console**: https://console.aws.amazon.com/kafka/
2. **Create Cluster**:
   - Cluster name: `hostly-kafka`
   - Kafka version: Latest
   - Broker type: Provisioned
   - Number of brokers: 2
   - Broker instance type: `kafka.t3.small`
   - VPC: `hostly-vpc`
   - Subnets: Select both subnets
   - Security group: `hostly-kafka-sg`
   - Click **Create**

### Step 9: Create ECS Services

#### Backend Service

1. **Go to ECS Cluster** → **Services** → **Create**
2. **Configure**:
   - Launch type: **Fargate**
   - Task Definition: `hostly-backend`
   - Service name: `hostly-backend-service`
   - Number of tasks: 2
   - VPC: `hostly-vpc`
   - Subnets: Select both subnets
   - Security group: `hostly-ecs-sg`
   - Auto-assign public IP: Enable
   - Load balancer: **None** (we'll add ALB separately)
   - Click **Create**

#### Frontend Service

1. **Create Service**:
   - Task Definition: `hostly-frontend`
   - Service name: `hostly-frontend-service`
   - Number of tasks: 2
   - Same network settings as backend
   - Click **Create**

#### Agent Service

1. **Create Service**:
   - Task Definition: `hostly-agent`
   - Service name: `hostly-agent-service`
   - Number of tasks: 1
   - Same network settings
   - Click **Create**

### Step 10: Create Application Load Balancer

1. **Go to EC2 Console** → **Load Balancers** → **Create Load Balancer**
2. **Select**: Application Load Balancer
3. **Configure**:
   - Name: `hostly-alb`
   - Scheme: Internet-facing
   - IP address type: IPv4
   - VPC: `hostly-vpc`
   - Subnets: Select both public subnets
   - Security group: `hostly-alb-sg`
   - Listeners: HTTP:80
   - Click **Create**

4. **Create Target Groups**:
   - **Backend Target Group**:
     - Name: `hostly-backend-tg`
     - Target type: IP
     - Protocol: HTTP, Port: 3000
     - VPC: `hostly-vpc`
     - Health check: `/api`
     - Register targets: Select backend tasks
   
   - **Frontend Target Group**:
     - Name: `hostly-frontend-tg`
     - Target type: IP
     - Protocol: HTTP, Port: 80
     - VPC: `hostly-vpc`
     - Health check: `/`
     - Register targets: Select frontend tasks

5. **Configure ALB Listeners**:
   - Select ALB → **Listeners** → **Add listener**
   - Protocol: HTTP, Port: 80
   - Default action: Forward to `hostly-frontend-tg`
   - Add rule:
     - Path: `/api/*` → Forward to `hostly-backend-tg`
     - Path: `/agent/*` → Forward to `hostly-agent-tg` (if needed)

### Step 11: Get ALB DNS Name

1. **Go to Load Balancers** → Select `hostly-alb`
2. **Copy DNS name**: `hostly-alb-xxxxx.us-east-1.elb.amazonaws.com`
3. **Update CORS_ORIGIN** in backend task definition with this URL
4. **Update VITE_API_BASE_URL** in frontend task definition

### Step 12: Update Services

1. **Go to each ECS Service** → **Update**
2. **Force new deployment** to pick up new environment variables
3. **Wait for tasks to be healthy**

---

## Option 2: EKS (Elastic Kubernetes Service) - Production Ready

Since you already have Kubernetes configurations, this is a good option for production.

### Step 1: Create EKS Cluster

```bash
# Install eksctl
# Windows (using Chocolatey)
choco install eksctl

# Or download from: https://github.com/weaveworks/eksctl/releases

# Create cluster
eksctl create cluster \
  --name hostly-cluster \
  --region us-east-1 \
  --nodegroup-name hostly-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# This takes 15-20 minutes
```

### Step 2: Configure kubectl

```bash
aws eks update-kubeconfig --name hostly-cluster --region us-east-1
kubectl get nodes
```

### Step 3: Push Images to ECR

Same as ECS Option (Step 2)

### Step 4: Update Kubernetes Manifests

1. **Update `k8s/configmap.yaml`** with AWS service endpoints
2. **Update `k8s/secrets.yaml`** with production secrets
3. **Update image references** in deployment files to ECR URIs

### Step 5: Apply Kubernetes Manifests

```bash
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f zookeeper-deployment.yaml
kubectl apply -f kafka-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f agent-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

### Step 6: Set Up Ingress Controller

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml

# Get Load Balancer URL
kubectl get svc -n ingress-nginx
```

---

## Option 3: EC2 with Docker Compose - Quick Start

### Step 1: Launch EC2 Instance

1. **Go to EC2 Console** → **Launch Instance**
2. **Configure**:
   - Name: `hostly-app`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: `t3.medium` (or larger for production)
   - Key pair: Create/select
   - Network: Create new security group
     - Allow SSH (22) from your IP
     - Allow HTTP (80) from anywhere
     - Allow HTTPS (443) from anywhere
     - Allow Custom TCP (3000, 8000) from anywhere (or restrict to ALB)
   - Storage: 30 GB
   - Click **Launch**

### Step 2: Connect and Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone <YOUR_REPO_URL>
cd Hostly

# Create .env file
nano .env
# Add all environment variables
```

### Step 3: Update docker-compose.yml

Update environment variables and URLs for production:

```yaml
# Update CORS_ORIGIN
CORS_ORIGIN: https://yourdomain.com

# Update VITE_API_BASE_URL
VITE_API_BASE_URL: https://yourdomain.com/api

# Use public IPs or domain names for services
```

### Step 4: Deploy

```bash
docker compose up -d
docker compose ps  # Check status
docker compose logs -f  # View logs
```

### Step 5: Set Up Domain (Optional)

1. **Go to Route 53 Console**
2. **Register domain** or use existing
3. **Create A record** pointing to EC2 public IP
4. **Set up SSL certificate** using Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment Configuration

### 1. Set Up Custom Domain

1. **Go to Route 53** → **Hosted zones**
2. **Create A record**:
   - Name: `api.yourdomain.com`
   - Type: A - Alias
   - Alias target: Your ALB
   - Routing policy: Simple

3. **Create another A record** for frontend:
   - Name: `yourdomain.com` or `www.yourdomain.com`
   - Type: A - Alias
   - Alias target: Your ALB

### 2. Set Up SSL Certificate

1. **Go to Certificate Manager**: https://console.aws.amazon.com/acm/
2. **Request certificate**:
   - Domain: `yourdomain.com` and `*.yourdomain.com`
   - Validation: DNS
   - Add CNAME records to Route 53
3. **Attach to ALB**:
   - Go to ALB → **Listeners** → **Add listener**
   - Protocol: HTTPS, Port: 443
   - Default SSL certificate: Select your certificate
   - Default action: Forward to target group

### 3. Update Environment Variables

Update all services with production URLs:
- `CORS_ORIGIN`: `https://yourdomain.com`
- `VITE_API_BASE_URL`: `https://api.yourdomain.com/api`
- `FRONTEND_URL`: `https://yourdomain.com`
- `BACKEND_URL`: `https://api.yourdomain.com`

### 4. Set Up CloudWatch Logs

ECS automatically sends logs to CloudWatch. View them:
- **Go to CloudWatch** → **Log groups**
- Find: `/ecs/hostly-backend`, `/ecs/hostly-frontend`, etc.

---

## Monitoring and Maintenance

### 1. CloudWatch Dashboards

1. **Go to CloudWatch** → **Dashboards** → **Create dashboard**
2. **Add widgets**:
   - ECS Service metrics (CPU, Memory)
   - ALB metrics (Request count, Response time)
   - Target group health
   - Error rates

### 2. Set Up Alarms

1. **Go to CloudWatch** → **Alarms** → **Create alarm**
2. **Monitor**:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Unhealthy targets
   - High error rate

### 3. Auto Scaling

**For ECS**:
1. Go to **ECS Service** → **Auto Scaling**
2. **Configure**:
   - Min capacity: 1
   - Max capacity: 10
   - Target tracking: CPU utilization at 70%

**For EKS**:
Use HPA (Horizontal Pod Autoscaler) - already configured in `k8s/hpa.yaml`

### 4. Backup Strategy

**MongoDB**:
```bash
# Create snapshot script
#!/bin/bash
mongodump --uri="mongodb://user:pass@host:27017/hostly" --out=/backup/$(date +%Y%m%d)
# Upload to S3
aws s3 sync /backup s3://hostly-backups/mongodb/
```

**Schedule with cron** or use AWS Backup service.

---

## Cost Optimization Tips

### 1. Use Reserved Instances
- For predictable workloads, purchase Reserved Instances (save up to 75%)

### 2. Right-Size Resources
- Start small, monitor, then scale up
- Use CloudWatch to identify over-provisioned resources

### 3. Use Spot Instances (EKS)
- For non-critical workloads, use Spot instances (save up to 90%)

### 4. Clean Up Unused Resources
- Delete unused ECR images
- Terminate test instances
- Remove unused load balancers

### 5. Use S3 for Static Assets
- Move uploaded files to S3
- Use CloudFront CDN for faster delivery

### Estimated Monthly Costs (Small Scale):

| Service | Configuration | Cost (USD) |
|---------|-------------|------------|
| ECS Fargate | 3 services, 0.5 vCPU each | ~$30-50 |
| ALB | 1 load balancer | ~$20 |
| EC2 (MongoDB) | t3.small | ~$15 |
| EC2 (Kafka) | t3.small | ~$15 |
| Data Transfer | 100 GB | ~$10 |
| CloudWatch | Basic monitoring | ~$5 |
| **Total** | | **~$95-115/month** |

For production with managed services:
- DocumentDB: ~$100/month
- MSK: ~$150/month
- **Total: ~$300-400/month**

---

## Troubleshooting

### Common Issues:

#### 1. Containers Not Starting
```bash
# Check ECS task logs
aws logs tail /ecs/hostly-backend --follow

# Check task status
aws ecs describe-tasks --cluster hostly-cluster --tasks <TASK_ID>
```

#### 2. Cannot Connect to Database
- Check security group rules
- Verify MongoDB is running
- Check connection string format
- Verify VPC/subnet configuration

#### 3. ALB Health Checks Failing
- Check target group health
- Verify security groups allow traffic
- Check application logs
- Verify port mappings

#### 4. CORS Errors
- Update `CORS_ORIGIN` in backend
- Verify frontend API URL
- Check browser console for exact error

#### 5. High Costs
- Review CloudWatch metrics
- Check for idle resources
- Use AWS Cost Explorer
- Set up billing alerts

### Useful Commands:

```bash
# ECS
aws ecs list-services --cluster hostly-cluster
aws ecs describe-services --cluster hostly-cluster --services hostly-backend-service
aws ecs update-service --cluster hostly-cluster --service hostly-backend-service --force-new-deployment

# EKS
kubectl get pods -n hostly
kubectl logs -f <pod-name> -n hostly
kubectl describe pod <pod-name> -n hostly

# Docker Compose (EC2)
docker compose ps
docker compose logs -f backend
docker compose restart backend
```

---

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use AWS Secrets Manager** for sensitive data
3. **Enable MFA** on AWS account
4. **Use IAM roles** instead of access keys when possible
5. **Regularly update** Docker images and dependencies
6. **Enable VPC Flow Logs** for network monitoring
7. **Use WAF** (Web Application Firewall) on ALB
8. **Enable encryption** at rest and in transit
9. **Regular security audits** using AWS Security Hub
10. **Backup regularly** and test restore procedures

---

## Next Steps

1. ✅ Deploy to AWS using one of the options above
2. ✅ Set up custom domain and SSL
3. ✅ Configure monitoring and alerts
4. ✅ Set up CI/CD pipeline (GitHub Actions, AWS CodePipeline)
5. ✅ Implement backup strategy
6. ✅ Load testing (use your JMeter tests)
7. ✅ Set up staging environment
8. ✅ Document runbooks for common operations

---

## Additional Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **ECS Best Practices**: https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/
- **EKS Workshop**: https://www.eksworkshop.com/
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/
- **AWS Free Tier**: https://aws.amazon.com/free/

---

## Support

For issues:
1. Check AWS Service Health Dashboard
2. Review CloudWatch logs
3. Check AWS Support Center
4. Post on AWS Forums or Stack Overflow

**Good luck with your deployment! 🚀**

