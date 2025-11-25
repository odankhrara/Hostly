# One-Command EC2 Deployment

## Quick Deploy - Copy and Paste This on Your EC2 Instance

Once you're connected to your EC2 instance (SSH), run this single command:

```bash
curl -fsSL https://raw.githubusercontent.com/odankhrara/Hostly/aws/deploy-from-github.sh | bash -s -- -r https://github.com/odankhrara/Hostly.git -b aws
```

**OR** if you want to download and run manually:

```bash
# Download the deployment script
curl -o deploy-from-github.sh https://raw.githubusercontent.com/odankhrara/Hostly/aws/deploy-from-github.sh

# Make it executable
chmod +x deploy-from-github.sh

# Run it
./deploy-from-github.sh
```

---

## What This Script Does

1. ✅ Updates system packages
2. ✅ Installs Docker and Docker Compose
3. ✅ Clones/pulls code from GitHub (aws branch)
4. ✅ Creates .env file with secure passwords
5. ✅ Prompts for API keys (OPENAI_API_KEY, TAVILY_API_KEY)
6. ✅ Updates docker-compose.yml with EC2 IP (18.218.47.142)
7. ✅ Builds all Docker images
8. ✅ Starts all services
9. ✅ Shows deployment status

---

## Step-by-Step Instructions

### 1. Connect to EC2

```bash
# From your local machine (PowerShell)
cd $env:USERPROFILE\Downloads
ssh -i hostly-key.pem ec2-user@18.218.47.142
# or if Ubuntu:
ssh -i hostly-key.pem ubuntu@18.218.47.142
```

### 2. Run Deployment Script

```bash
# Option A: Direct download and run (recommended)
curl -fsSL https://raw.githubusercontent.com/odankhrara/Hostly/aws/deploy-from-github.sh -o deploy.sh && chmod +x deploy.sh && ./deploy.sh

# Option B: Clone repository first, then run
git clone -b aws https://github.com/odankhrara/Hostly.git
cd Hostly
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

### 3. Enter API Keys When Prompted

When the script asks, enter:
- `OPENAI_API_KEY`: Your OpenAI API key
- `TAVILY_API_KEY`: Your Tavily API key

(You can press Enter to skip and add them later in the .env file)

### 4. Wait for Deployment

The script will:
- Install Docker (if not installed)
- Clone code from GitHub
- Build Docker images (takes 5-10 minutes)
- Start all services

### 5. Access Your Application

After deployment completes (2-3 minutes), access:
- **Frontend**: http://18.218.47.142:5173
- **Backend API**: http://18.218.47.142:3000/api
- **Agent Service**: http://18.218.47.142:8000/docs
- **Mongo Express**: http://18.218.47.142:8081

---

## Manual Steps (If Script Fails)

If you prefer to do it manually:

```bash
# 1. Install Docker
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone repository
git clone -b aws https://github.com/odankhrara/Hostly.git
cd Hostly

# 4. Create .env file (or use setup-env.sh)
nano .env
# Add your environment variables

# 5. Update docker-compose.yml with EC2 IP
sed -i 's|CORS_ORIGIN: http://localhost:5173|CORS_ORIGIN: http://18.218.47.142:5173|g' docker-compose.yml
sed -i 's|VITE_API_BASE_URL: http://localhost:3000/api|VITE_API_BASE_URL: http://18.218.47.142:3000/api|g' docker-compose.yml
sed -i 's|FRONTEND_URL: http://localhost:5173|FRONTEND_URL: http://18.218.47.142:5173|g' docker-compose.yml
sed -i 's|BACKEND_URL: http://backend:3000|BACKEND_URL: http://18.218.47.142:3000|g' docker-compose.yml

# 6. Deploy
docker compose up -d --build

# 7. Check status
docker compose ps
docker compose logs -f
```

---

## Troubleshooting

### Issue: Script fails with permission error
```bash
# Make sure you're not root, and run:
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: Can't clone from GitHub
```bash
# Check internet connection
ping -c 3 github.com

# Try cloning manually
git clone -b aws https://github.com/odankhrara/Hostly.git
```

### Issue: Docker build fails
```bash
# Check logs
docker compose logs

# Try rebuilding
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue: Services won't start
```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f agent-service

# Check disk space
df -h

# Check memory
free -h
```

---

## Updating After Code Changes

If you push new code to GitHub:

```bash
cd ~/Hostly
git pull origin aws
docker compose down
docker compose up -d --build
```

---

## Useful Commands

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f backend

# Restart a service
docker compose restart backend

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Rebuild and restart
docker compose up -d --build

# Check status
docker compose ps

# Check resource usage
docker stats
```

---

**Your code is now on GitHub (aws branch) and ready to deploy! 🚀**

