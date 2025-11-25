# Docker and AWS ECS Deployment Guide for Hostly

**This guide uses AWS Console (GUI) - No CLI commands needed!**

## Prerequisites
- ✅ Docker installed on your local machine
- ✅ AWS account with ECS permissions
- ✅ Your Hostly project code ready

---

## Part 1: Docker Setup and Local Testing

### Step 1: Verify Your Project Structure

Make sure you have these folders:
```
Hostly/
├── frontend/
├── backend/
├── agent-service/
└── docker-compose.yml
```

### Step 2: Test Locally First

```bash
# Make sure you're in the Hostly directory
cd "C:\Users\Jenil Savalia\Desktop\Hostly LAB2\Hostly"

# Start all services
docker compose up -d

# Check if everything is running
docker compose ps

# Test in browser:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000/api
# Agent: http://localhost:8000/docs
```

### Step 3: Take Screenshot
- Open `http://localhost:5173` in your browser
- **Take a screenshot** of your application running locally
- This is for your project documentation

### Step 4: Stop Containers (when done testing)
```bash
# Stop containers but keep them (recommended for testing)
docker compose stop

# OR if you want to remove everything completely:
# docker compose down
```

**Note**: Use `stop` if you might restart later (faster). Use `down` for complete cleanup.

---

## Part 2: AWS ECS Deployment (Using AWS Console)

### Step 1: Get Your AWS Account ID

1. Go to **AWS Console** → Click your username (top right)
2. Your **Account ID** is displayed (12-digit number)
3. **Write it down** - you'll need it (e.g., `123456789012`)

---

### Step 2: Create ECR Repositories

We need **3 repositories** (one for each service):

#### Repository 1: Frontend

1. Go to **AWS Console** → **Elastic Container Registry (ECR)**
2. Click **"Create repository"**
3. **Visibility settings**: Private
4. **Repository name**: `hostly-frontend`
5. Leave other settings as default
6. Click **"Create repository"**
7. **Copy the repository URI** (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/hostly-frontend`)

#### Repository 2: Backend

1. Click **"Create repository"** again
2. **Repository name**: `hostly-backend`
3. Click **"Create repository"**
4. **Copy the repository URI**

#### Repository 3: Agent Service

1. Click **"Create repository"** again
2. **Repository name**: `hostly-agent`
3. Click **"Create repository"**
4. **Copy the repository URI**

---

### Step 3: Build and Push Docker Images

For each service, we'll build and push the image. **Replace `YOUR_ACCOUNT_ID` with your actual account ID.**

#### Push Frontend Image

1. Click on **`hostly-frontend`** repository
2. Click **"View push commands"** button
3. **Follow the commands shown** (they'll be customized for your account)

**Or manually run these** (replace `YOUR_ACCOUNT_ID` and `us-east-1` with your values):

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build frontend
cd frontend
docker build -t hostly-frontend .
docker tag hostly-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-frontend:latest
cd ..
```

#### Push Backend Image

1. Click on **`hostly-backend`** repository
2. Click **"View push commands"**
3. Follow the commands:

```bash
# Build backend
cd backend
docker build -t hostly-backend .
docker tag hostly-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-backend:latest
cd ..
```

#### Push Agent Service Image

1. Click on **`hostly-agent`** repository
2. Click **"View push commands"**
3. Follow the commands:

```bash
# Build agent service
cd agent-service
docker build -t hostly-agent .
docker tag hostly-agent:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-agent:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-agent:latest
cd ..
```

**Note**: If you get "aws: command not found", install AWS CLI:
- Windows: Download from https://aws.amazon.com/cli/
- Or use: `winget install Amazon.AWSCLI`

---

### Step 4: Create VPC and Networking

1. Go to **VPC Console** → **Your VPCs**
2. Check if you have a **default VPC** (you should see one)
3. If you have a default VPC, **note its ID** (e.g., `vpc-12345678`)
4. If you don't have one, create it:
   - Click **"Create VPC"**
   - Choose **"VPC and more"**
   - Name: `hostly-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - Click **"Create VPC"**

5. **Note your public subnets**:
   - Go to **Subnets**
   - Look for subnets in your VPC
   - **Note 2 public subnet IDs** (they'll be used later)
   - Public subnets have "Auto-assign public IPv4 address" = Yes

---

### Step 5: Create Security Groups

#### Security Group 1: For ECS Tasks

1. Go to **EC2 Console** → **Security Groups**
2. Click **"Create security group"**
3. **Basic details**:
   - Name: `hostly-ecs-sg`
   - Description: `Security group for Hostly ECS services`
   - VPC: Select your default VPC (or the one you created)
4. **Inbound rules**: Click **"Add rule"**
   - Type: **HTTP**
   - Port: **80**
   - Source: **Anywhere-IPv4** (0.0.0.0/0)
   - Click **"Add rule"** again:
   - Type: **Custom TCP**
   - Port: **3000**
   - Source: **Anywhere-IPv4** (0.0.0.0/0)
   - Click **"Add rule"** again:
   - Type: **Custom TCP**
   - Port: **8000**
   - Source: **Anywhere-IPv4** (0.0.0.0/0)
5. **Outbound rules**: Leave default (Allow all)
6. Click **"Create security group"**

#### Security Group 2: For Load Balancer (Optional but Recommended)

1. Click **"Create security group"** again
2. **Basic details**:
   - Name: `hostly-alb-sg`
   - Description: `Security group for Application Load Balancer`
   - VPC: Same VPC as above
3. **Inbound rules**:
   - Type: **HTTP**, Port: **80**, Source: **Anywhere-IPv4**
   - Type: **HTTPS**, Port: **443**, Source: **Anywhere-IPv4**
4. Click **"Create security group"**

---

### Step 6: Create ECS Cluster

**IMPORTANT: Fix these issues first if you see errors:**

#### Fix Issue 1: Delete Failed CloudFormation Stack

1. Go to **CloudFormation Console**: https://console.aws.amazon.com/cloudformation/
2. Look for stack: `Infra-ECS-Cluster-hostly-cluster-18dcfe17` (or similar)
3. Select the stack → Click **"Delete"**
4. Wait for deletion to complete (takes 1-2 minutes)

#### Fix Issue 2: Create ECS Service Linked Role

1. Go to **IAM Console** → **Roles**
2. Search for: `AWSServiceRoleForECS`
3. **If it doesn't exist**, create it:
   - Go to **IAM Console** → **Roles** → **Create role**
   - **Trusted entity type**: AWS service
   - **Use case**: ECS
   - Select: **Elastic Container Service**
   - Click **"Next"** → **"Next"** → **"Create role"**
   - The role name will be: `AWSServiceRoleForECS`

**OR use AWS CLI** (faster):
```powershell
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
```

#### Now Create the Cluster:

1. Go to **ECS Console**
2. Click **"Clusters"** → **"Create Cluster"**
3. **Cluster configuration**:
   - Cluster name: `hostly-cluster` (or use a different name like `hostly-cluster-v2` if stack deletion fails)
   - Infrastructure: Select **"AWS Fargate (serverless)"**
   - Leave other settings as default
4. Click **"Create"**
5. Wait for cluster to be created (takes ~1 minute)

---

### Step 7: Create Task Definitions

We need **3 task definitions** (one for each service).

#### Task Definition 1: Frontend

1. In ECS Console, click **"Task definitions"** → **"Create new Task Definition"**
2. **Task definition configuration**:
   - Task definition family: `hostly-frontend-task`
   - Launch type: **"AWS Fargate"**
   - Operating system: **"Linux/X86_64"**
   - CPU: **0.25 vCPU**
   - Memory: **0.5 GB**
   - Task execution role: Select **"ecsTaskExecutionRole"** (if it doesn't exist, click "Create new role")
   - Task role: Leave default

3. **Container definitions** → Click **"Add container"**:
   - **Container name**: `frontend`
   - **Image URI**: Paste your frontend ECR URI (e.g., `YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hostly-frontend:latest`)
   - **Port mappings**:
     - Container port: **80**
     - Protocol: **TCP**
     - Port name: `web-80-tcp`
     - App protocol: **HTTP**
   - **Environment variables** (click "Add environment variable"):
     - Key: `VITE_API_BASE_URL`
     - Value: `http://YOUR_BACKEND_IP:3000/api` (we'll update this later)
   - **Logging** (optional but recommended):
     - Log driver: **awslogs**
     - Log group: `/ecs/hostly-frontend` (will be created automatically)
     - Log region: **us-east-1** (or your region)
     - Log stream prefix: `ecs`
   - Click **"Add"**

4. Click **"Create"** at the bottom

#### Task Definition 2: Backend

1. Click **"Create new Task Definition"** again
2. **Task definition configuration**:
   - Task definition family: `hostly-backend-task`
   - Launch type: **"AWS Fargate"**
   - Operating system: **"Linux/X86_64"**
   - CPU: **0.5 vCPU**
   - Memory: **1 GB**
   - Task execution role: **ecsTaskExecutionRole**

3. **Container definitions** → Click **"Add container"**:
   - **Container name**: `backend`
   - **Image URI**: Your backend ECR URI
   - **Port mappings**:
     - Container port: **3000**
     - Protocol: **TCP**
     - Port name: `api-3000-tcp`
     - App protocol: **HTTP**
   - **Environment variables** (click "Add environment variable" for each):
     ```
     NODE_ENV = production
     PORT = 3000
     MONGODB_URI = mongodb://admin:password@YOUR_MONGODB_IP:27017/hostly?authSource=admin
     MONGODB_HOST = YOUR_MONGODB_IP
     MONGODB_PORT = 27017
     MONGODB_DB = hostly
     MONGODB_USER = admin
     MONGODB_PASSWORD = YOUR_SECURE_PASSWORD
     SESSION_SECRET = YOUR_RANDOM_SECRET_STRING
     OPENAI_API_KEY = YOUR_OPENAI_API_KEY
     CORS_ORIGIN = http://YOUR_FRONTEND_IP:5173
     KAFKA_BROKER = YOUR_KAFKA_IP:9092
     ```
     **Note**: We'll update these IPs after services are running
   - **Logging**:
     - Log driver: **awslogs**
     - Log group: `/ecs/hostly-backend`
     - Log region: **us-east-1**
     - Log stream prefix: `ecs`
   - Click **"Add"**

4. Click **"Create"**

#### Task Definition 3: Agent Service

1. Click **"Create new Task Definition"** again
2. **Task definition configuration**:
   - Task definition family: `hostly-agent-task`
   - Launch type: **"AWS Fargate"**
   - Operating system: **"Linux/X86_64"**
   - CPU: **0.5 vCPU**
   - Memory: **1 GB**
   - Task execution role: **ecsTaskExecutionRole**

3. **Container definitions** → Click **"Add container"**:
   - **Container name**: `agent`
   - **Image URI**: Your agent ECR URI
   - **Port mappings**:
     - Container port: **8000**
     - Protocol: **TCP**
     - Port name: `agent-8000-tcp`
     - App protocol: **HTTP**
   - **Environment variables**:
     ```
     MONGODB_URI = mongodb://admin:password@YOUR_MONGODB_IP:27017/hostly?authSource=admin
     OPENAI_API_KEY = YOUR_OPENAI_API_KEY
     TAVILY_API_KEY = YOUR_TAVILY_API_KEY
     HOST = 0.0.0.0
     PORT = 8000
     FRONTEND_URL = http://YOUR_FRONTEND_IP:5173
     BACKEND_URL = http://YOUR_BACKEND_IP:3000
     ```
   - **Logging**:
     - Log driver: **awslogs**
     - Log group: `/ecs/hostly-agent`
     - Log region: **us-east-1**
     - Log stream prefix: `ecs`
   - Click **"Add"**

4. Click **"Create"**

---

### Step 8: Deploy MongoDB (Simplified - Use EC2)

For simplicity, we'll deploy MongoDB on a separate EC2 instance:

1. Go to **EC2 Console** → **Launch Instance**
2. **Name**: `hostly-mongodb`
3. **AMI**: Ubuntu Server 22.04 LTS
4. **Instance type**: `t3.small` (or `t2.micro` for free tier)
5. **Key pair**: Create new or select existing
6. **Network settings**:
   - VPC: Same as your ECS cluster
   - Subnet: Any public subnet
   - Auto-assign Public IP: **Enable**
   - Security group: Create new
     - Name: `hostly-mongodb-sg`
     - Allow SSH (22) from your IP
     - Allow Custom TCP (27017) from `hostly-ecs-sg` security group
7. **Storage**: 20 GB
8. Click **"Launch instance"**

9. **After instance starts, SSH into it**:
   ```bash
   ssh -i your-key.pem ubuntu@MONGODB_PUBLIC_IP
   ```

10. **Install Docker and run MongoDB**:
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    newgrp docker
    
    docker run -d \
      --name mongodb \
      --restart unless-stopped \
      -p 27017:27017 \
      -e MONGO_INITDB_ROOT_USERNAME=admin \
      -e MONGO_INITDB_ROOT_PASSWORD=YOUR_SECURE_PASSWORD \
      mongo:7.0
    ```

11. **Note the MongoDB public IP** - you'll need it for environment variables

**Same process for Kafka** (or skip Kafka for now if it's not critical):

1. Launch another EC2 instance: `hostly-kafka`
2. Run Zookeeper and Kafka containers (or use docker-compose)
3. Note the Kafka IP

---

### Step 9: Create ECS Services

#### Service 1: Frontend

1. Go to your cluster (`hostly-cluster`)
2. Click **"Services"** tab → **"Create"**
3. **Compute configuration**:
   - Launch type: **"Fargate"**
   - Platform version: **LATEST**
4. **Deployment configuration**:
   - Application type: **"Service"**
   - Task definition: Select **`hostly-frontend-task`** (latest revision)
   - Service name: `hostly-frontend-service`
   - Desired tasks: **1**
5. **Networking**:
   - VPC: Select your default VPC
   - Subnets: Select **at least 2 public subnets**
   - Security group: Select **`hostly-ecs-sg`**
   - Public IP: **"Enabled"** (Very important!)
6. **Load balancing** (optional for now): Leave as "None"
7. Click **"Create"**

#### Service 2: Backend

1. Click **"Create"** again
2. **Compute configuration**: Fargate, LATEST
3. **Deployment configuration**:
   - Task definition: **`hostly-backend-task`**
   - Service name: `hostly-backend-service`
   - Desired tasks: **1**
4. **Networking**: Same as frontend
5. Click **"Create"**

#### Service 3: Agent Service

1. Click **"Create"** again
2. **Compute configuration**: Fargate, LATEST
3. **Deployment configuration**:
   - Task definition: **`hostly-agent-task`**
   - Service name: `hostly-agent-service`
   - Desired tasks: **1**
4. **Networking**: Same as frontend
5. Click **"Create"**

---

### Step 10: Wait for Deployment

1. Go to each service → **"Tasks"** tab
2. Wait until task status shows **"RUNNING"** (takes 2-5 minutes)
3. If status is "STOPPED", click on the task to see why it stopped
4. Check **"Logs"** tab in CloudWatch if there are issues

---

### Step 11: Get Public IP Addresses

1. Go to each service → **"Tasks"** tab
2. Click on the running task
3. In task details, find **"Public IP"** in the "Configuration" section
4. **Copy each IP**:
   - Frontend IP: `http://FRONTEND_IP:80` (or just `http://FRONTEND_IP`)
   - Backend IP: `http://BACKEND_IP:3000`
   - Agent IP: `http://AGENT_IP:8000`

---

### Step 12: Update Environment Variables

Now that we have IPs, we need to update the task definitions:

1. Go to **Task definitions**
2. For each task definition:
   - Click on the task definition name
   - Click **"Create new revision"**
   - Update environment variables with actual IPs:
     - Frontend: Update `VITE_API_BASE_URL` with backend IP
     - Backend: Update `MONGODB_HOST`, `CORS_ORIGIN`, `KAFKA_BROKER` with actual IPs
     - Agent: Update all URLs with actual IPs
   - Click **"Create"**
3. **Update each service** to use the new task definition:
   - Go to service → **"Update"**
   - Task definition: Select the new revision
   - Click **"Update"**
   - Wait for new tasks to deploy

---

### Step 13: Access Your Application

1. Open your browser
2. Navigate to: `http://FRONTEND_PUBLIC_IP`
3. **Take a screenshot** of your application running on AWS
4. Test the application:
   - Try logging in
   - Try creating a property
   - Test AI features

---

## Alternative: Using Application Load Balancer (Recommended)

For a permanent URL instead of changing IPs:

### Step 1: Create Application Load Balancer

1. Go to **EC2 Console** → **Load Balancers** → **"Create Load Balancer"**
2. Choose **"Application Load Balancer"**
3. **Basic configuration**:
   - Name: `hostly-alb`
   - Scheme: **"Internet-facing"**
   - IP address type: **"IPv4"**
4. **Network mapping**:
   - VPC: Select your default VPC
   - Mappings: Select **at least 2 public subnets**
5. **Security groups**: Select **`hostly-alb-sg`**
6. **Listeners and routing**:
   - Protocol: **HTTP**, Port: **80**
   - Default action: Create new target group (we'll configure later)
7. Click **"Create load balancer"**

### Step 2: Create Target Groups

#### Target Group 1: Frontend

1. Go to **Target Groups** → **"Create target group"**
2. **Basic configuration**:
   - Target type: **"IP addresses"**
   - Target group name: `hostly-frontend-tg`
   - Protocol: **HTTP**, Port: **80**
   - VPC: Select your VPC
3. **Health checks**:
   - Health check path: `/`
4. Click **"Next"**
5. **Register targets**: Skip for now (we'll add after service is running)
6. Click **"Create target group"**

#### Target Group 2: Backend

1. Create another target group:
   - Name: `hostly-backend-tg`
   - Protocol: **HTTP**, Port: **3000**
   - Health check path: `/api`
2. Click **"Create target group"**

### Step 3: Update ALB Listener Rules

1. Go to **Load Balancers** → Select `hostly-alb`
2. Click **"Listeners"** tab → Click on listener (port 80)
3. **Default action**: Forward to `hostly-frontend-tg`
4. Click **"Add rule"**:
   - **IF**: Path is `/api/*`
   - **THEN**: Forward to `hostly-backend-tg`
5. Click **"Add rule"** again:
   - **IF**: Path is `/agent/*`
   - **THEN**: Forward to `hostly-agent-tg` (create this target group too)
6. Click **"Save"**

### Step 4: Update ECS Services to Use ALB

1. Go to each ECS service → **"Update"**
2. **Load balancing**:
   - Load balancer type: **"Application Load Balancer"**
   - Load balancer: Select `hostly-alb`
   - Container to load balance: Select your container
   - Target group: Select corresponding target group
3. Click **"Update"**

### Step 5: Get ALB DNS Name

1. Go to **Load Balancers** → Select `hostly-alb`
2. Copy the **DNS name** (e.g., `hostly-alb-123456789.us-east-1.elb.amazonaws.com`)
3. Access your app: `http://ALB_DNS_NAME`
4. **Take a screenshot** of your application running on the ALB URL

---

## Cleanup (When Done)

### Step 1: Stop ECS Services

1. Go to each service → **"Update"**
2. Set **Desired tasks** to **0**
3. Click **"Update"**
4. Wait for tasks to stop
5. Click **"Delete"** on each service

### Step 2: Delete Cluster

1. Go to **Clusters** → Select `hostly-cluster`
2. Click **"Delete cluster"**

### Step 3: Deregister Task Definitions

1. Go to **Task definitions**
2. Select each task definition
3. Click **"Deregister"** for all revisions

### Step 4: Delete ECR Repositories

1. Go to **ECR** → Select each repository
2. Click **"Delete"**
3. Check **"Force delete"** to delete images too

### Step 5: Delete Security Groups

1. Go to **EC2** → **Security Groups**
2. Delete `hostly-ecs-sg` and `hostly-alb-sg`

### Step 6: Terminate EC2 Instances

1. Go to **EC2** → **Instances**
2. Select MongoDB and Kafka instances
3. Click **"Terminate"**

### Step 7: Delete Load Balancer (if created)

1. Go to **Load Balancers** → Select `hostly-alb`
2. Click **"Delete"**
3. Delete target groups too

---

## Important Notes

1. **Replace Placeholders**: 
   - Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID
   - Replace `YOUR_MONGODB_IP` with actual MongoDB EC2 instance IP
   - Replace `YOUR_KAFKA_IP` with actual Kafka IP (if using)
   - Replace `YOUR_FRONTEND_IP`, `YOUR_BACKEND_IP` with actual ECS task IPs

2. **Region**: This guide uses `us-east-1`. Change if you prefer a different region.

3. **Costs**: 
   - ECS Fargate: ~$0.04/hour per 0.25 vCPU task
   - EC2 instances: ~$0.02/hour for t2.micro (free tier eligible)
   - **Total**: ~$30-50/month for small deployment
   - **Remember to clean up when done!**

4. **Screenshots Required**:
   - ✅ Local application running on `localhost:5173`
   - ✅ Application running on ECS public IP or ALB DNS name

5. **Permissions**: Ensure your AWS user has permissions for:
   - ECS (full access)
   - ECR (full access)
   - EC2 (for security groups, VPC, instances)
   - IAM (for task execution roles)
   - CloudWatch (for logs)

---

## Troubleshooting

### Issue: Task keeps stopping
- **Check**: CloudWatch logs (go to service → Tasks → Click task → Logs tab)
- **Common causes**: Wrong environment variables, missing dependencies, port conflicts

### Issue: Can't access application
- **Check**: Security group allows HTTP (80) from anywhere
- **Check**: Task has public IP enabled
- **Check**: Task is in public subnet

### Issue: Services can't connect to MongoDB
- **Check**: MongoDB security group allows port 27017 from ECS security group
- **Check**: MongoDB is running (SSH into EC2 and check: `docker ps`)

### Issue: Images won't push to ECR
- **Check**: AWS CLI is configured: `aws configure`
- **Check**: You're logged in: `aws ecr get-login-password --region us-east-1`

---

## Quick Reference: IPs and URLs

After deployment, note these:

- **Frontend Public IP**: `http://XXX.XXX.XXX.XXX`
- **Backend Public IP**: `http://XXX.XXX.XXX.XXX:3000`
- **Agent Public IP**: `http://XXX.XXX.XXX.XXX:8000`
- **MongoDB IP**: `XXX.XXX.XXX.XXX:27017`
- **ALB DNS** (if using): `http://hostly-alb-xxx.us-east-1.elb.amazonaws.com`

---

**You're all set! Follow these steps and your Hostly app will be running on AWS ECS! 🚀**

