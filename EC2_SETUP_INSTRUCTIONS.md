# EC2 Setup Instructions - Quick Start Guide

## Your EC2 Instance
- **Public IP**: `18.218.47.142`
- **Key Pair**: `hostly-key` (in Downloads folder)

---

## Step-by-Step Setup

### Step 1: Connect to EC2 Instance

```bash
# From your local machine (PowerShell)
cd $env:USERPROFILE\Downloads
ssh -i hostly-key.pem ec2-user@18.218.47.142
# or if Ubuntu:
ssh -i hostly-key.pem ubuntu@18.218.47.142
```

---

### Step 2: Run the Setup Script

Once connected to EC2, run:

```bash
# Download and run the setup script
curl -o ec2-setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/Hostly/main/ec2-setup.sh
# OR if you have the files, upload them first using SCP/WinSCP

# Make it executable
chmod +x ec2-setup.sh

# Run the setup
./ec2-setup.sh
```

**OR manually run these commands:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl wget unzip ca-certificates gnupg lsb-release netcat-openbsd

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for docker group to take effect
exit
```

**Reconnect:**
```bash
ssh -i hostly-key.pem ec2-user@18.218.47.142
```

---

### Step 3: Clone Your Repository

```bash
# Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/Hostly.git
cd Hostly

# OR if repository is private, you'll need to set up SSH keys or use HTTPS with token
```

---

### Step 4: Upload Setup Scripts (If Not Using Git)

If you prefer to upload the scripts manually:

**From your local machine (PowerShell):**
```powershell
cd "C:\Users\Jenil Savalia\Desktop\Hostly LAB2\Hostly"
scp -i $env:USERPROFILE\Downloads\hostly-key.pem ec2-setup.sh setup-env.sh update-docker-compose.sh deploy.sh ec2-user@18.218.47.142:~/
```

**Then on EC2:**
```bash
chmod +x *.sh
```

---

### Step 5: Set Up Environment

```bash
cd ~/Hostly

# Run environment setup (creates .env file)
chmod +x setup-env.sh
./setup-env.sh
```

This will:
- Generate secure passwords for MongoDB
- Generate session secret
- Prompt for API keys (OPENAI_API_KEY, TAVILY_API_KEY)
- Create `.env` file

**Important**: Save the generated passwords shown on screen!

---

### Step 6: Update Docker Compose

```bash
# Update docker-compose.yml with EC2 IP
chmod +x update-docker-compose.sh
./update-docker-compose.sh
```

This updates:
- CORS_ORIGIN
- VITE_API_BASE_URL
- FRONTEND_URL
- BACKEND_URL

---

### Step 7: Deploy Application

```bash
# Deploy all services
chmod +x deploy.sh
./deploy.sh
```

This will:
- Build all Docker images
- Start all containers
- Show container status

**Wait 2-3 minutes** for all services to start.

---

### Step 8: Verify Deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f agent-service
```

**Test endpoints:**
- Frontend: http://18.218.47.142:5173
- Backend: http://18.218.47.142:3000/api
- Agent Service: http://18.218.47.142:8000/docs
- Mongo Express: http://18.218.47.142:8081

---

## Quick Reference Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f agent-service
docker compose logs -f mongodb
docker compose logs -f kafka
```

### Manage Services
```bash
# Stop all services
docker compose down

# Start all services
docker compose up -d

# Restart a service
docker compose restart backend

# Rebuild and restart
docker compose up -d --build

# View status
docker compose ps
```

### System Information
```bash
# Disk usage
df -h

# Memory usage
free -h

# Docker disk usage
docker system df
```

---

## Troubleshooting

### Issue: Permission denied for docker
**Solution**: Log out and back in, or run:
```bash
newgrp docker
```

### Issue: Containers won't start
**Solution**: Check logs
```bash
docker compose logs
```

### Issue: Port already in use
**Solution**: Stop existing containers
```bash
docker compose down
docker ps -a
docker rm <container-id>
```

### Issue: Out of disk space
**Solution**: Clean up Docker
```bash
docker system prune -a
docker volume prune
```

### Issue: MongoDB connection error
**Solution**: Wait 1-2 minutes for MongoDB to fully start, then check:
```bash
docker compose logs mongodb
```

### Issue: Can't access from browser
**Solution**: 
1. Check security groups allow ports 3000, 5173, 8000, 8081
2. Check containers are running: `docker compose ps`
3. Check logs for errors: `docker compose logs`

---

## File Structure After Setup

```
~/Hostly/
├── docker-compose.yml
├── .env                    # Environment variables (created by setup-env.sh)
├── ec2-setup.sh           # Initial setup script
├── setup-env.sh           # Environment setup script
├── update-docker-compose.sh # Docker compose update script
├── deploy.sh              # Deployment script
├── backend/
├── frontend/
├── agent-service/
└── ...
```

---

## Next Steps

1. ✅ Application is deployed and running
2. ✅ Test all endpoints
3. ✅ Set up domain name (optional)
4. ✅ Set up SSL/HTTPS (optional)
5. ✅ Set up monitoring (optional)

---

## Security Reminders

⚠️ **Important**:
- Keep your `.env` file secure (don't commit to Git)
- Update API keys in `.env` if you skipped them
- Consider restricting database ports in security groups
- Regularly update Docker images
- Set up backups for MongoDB data

---

**Your application is now live at http://18.218.47.142:5173! 🚀**

