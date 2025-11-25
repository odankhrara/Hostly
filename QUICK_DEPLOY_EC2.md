# Quick Deploy to EC2 - Step by Step (EASIEST METHOD)

This is the **fastest and easiest** way to deploy your Hostly application to AWS. Follow these steps in order.

## ⏱️ Total Time: 30-60 minutes

---

## Step 1: Launch EC2 Instance (10 minutes)

1. **Go to AWS Console**: https://console.aws.amazon.com/ec2/
2. **Click "Launch Instance"**
3. **Configure**:
   - **Name**: `hostly-app`
   - **AMI**: Search for "Ubuntu Server 22.04 LTS" → Select it
   - **Instance type**: `t3.medium` (2 vCPU, 4 GB RAM) - **Free tier eligible: t2.micro** (but may be slow)
   - **Key pair**: 
     - Click "Create new key pair"
     - Name: `hostly-key`
     - Key pair type: RSA
     - File format: `.pem` (for Linux/Mac) or `.ppk` (for Windows)
     - Click "Create key pair" → **SAVE THE FILE** (you'll need it!)
   
4. **Network settings**:
   - Click "Edit"
   - **Security group**: Create new security group
   - **Name**: `hostly-sg`
   - **Add rules**:
     - SSH (22) - Source: My IP (or 0.0.0.0/0 for testing, but less secure)
     - HTTP (80) - Source: 0.0.0.0/0
     - HTTPS (443) - Source: 0.0.0.0/0
     - Custom TCP (3000) - Source: 0.0.0.0/0 (Backend)
     - Custom TCP (8000) - Source: 0.0.0.0/0 (Agent Service)
     - Custom TCP (5173) - Source: 0.0.0.0/0 (Frontend - if needed)
   
5. **Storage**: 30 GB (default is fine)
6. **Click "Launch Instance"**

7. **Wait for instance to start** (2-3 minutes)
   - Status will change from "Pending" to "Running"
   - Click on instance ID to see details
   - **Copy the "Public IPv4 address"** (e.g., `54.123.45.67`)

---

## Step 2: Connect to Your Instance (5 minutes)

### Windows (PowerShell):

```powershell
# Navigate to where you saved the key file
cd C:\Users\YourName\Downloads

# Set permissions (if using WSL/Git Bash)
icacls hostly-key.pem /inheritance:r
icacls hostly-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect (replace with your IP)
ssh -i hostly-key.pem ubuntu@YOUR_PUBLIC_IP
```

### If SSH doesn't work on Windows:

1. **Use PuTTY** (if you downloaded .ppk file):
   - Download PuTTY: https://www.putty.org/
   - Open PuTTY
   - Host Name: `ubuntu@YOUR_PUBLIC_IP`
   - Connection → SSH → Auth → Credentials
   - Browse and select your `.ppk` file
   - Click "Open"

2. **Or use AWS Systems Manager Session Manager** (no SSH key needed):
   - Go to EC2 Console → Select instance → Click "Connect"
   - Choose "Session Manager" tab
   - Click "Connect"

---

## Step 3: Install Docker and Docker Compose (5 minutes)

Once connected, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
```

**Reconnect** to your instance:
```bash
ssh -i hostly-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

## Step 4: Upload Your Code (5 minutes)

### Option A: Using Git (Recommended)

```bash
# Install Git
sudo apt install git -y

# Clone your repository
git clone YOUR_REPO_URL
cd Hostly

# Or if you have a private repo, you'll need to set up SSH keys
```

### Option B: Using SCP (Windows PowerShell)

```powershell
# From your local machine (PowerShell)
# Navigate to your project folder
cd "C:\Users\Jenil Savalia\Desktop\Hostly LAB2\Hostly"

# Upload entire project (replace with your IP and key path)
scp -i C:\path\to\hostly-key.pem -r * ubuntu@YOUR_PUBLIC_IP:~/hostly
```

### Option C: Using WinSCP (GUI - Easiest for Windows)

1. Download WinSCP: https://winscp.net/
2. Open WinSCP
3. **New Session**:
   - File protocol: SFTP
   - Host name: `YOUR_PUBLIC_IP`
   - User name: `ubuntu`
   - Private key file: Browse and select your `.ppk` or `.pem` file
   - Click "Login"
4. Drag and drop your project folder to the server

---

## Step 5: Create Environment File (5 minutes)

On your EC2 instance:

```bash
cd ~/hostly  # or wherever you uploaded your code

# Create .env file
nano .env
```

**Add these variables** (press `Ctrl+X`, then `Y`, then `Enter` to save):

```env
# MongoDB
MONGODB_DB=hostly
MONGODB_USER=admin
MONGODB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_URI=mongodb://admin:YOUR_SECURE_PASSWORD_HERE@localhost:27017/hostly?authSource=admin

# Backend
NODE_ENV=production
PORT=3000
SESSION_SECRET=YOUR_RANDOM_SECRET_STRING_HERE
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
CORS_ORIGIN=http://YOUR_PUBLIC_IP:5173
KAFKA_BROKER=localhost:9092

# Agent Service
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
FRONTEND_URL=http://YOUR_PUBLIC_IP:5173
BACKEND_URL=http://YOUR_PUBLIC_IP:3000

# Frontend (will be set in docker-compose)
VITE_API_BASE_URL=http://YOUR_PUBLIC_IP:3000/api
```

**Generate secure passwords**:
```bash
# Generate random password
openssl rand -base64 32

# Generate session secret
openssl rand -hex 32
```

---

## Step 6: Update docker-compose.yml (5 minutes)

Edit the docker-compose.yml to use environment variables:

```bash
nano docker-compose.yml
```

**Update these sections**:

1. **Backend CORS_ORIGIN**:
```yaml
CORS_ORIGIN: ${CORS_ORIGIN:-http://YOUR_PUBLIC_IP:5173}
```

2. **Frontend VITE_API_BASE_URL**:
```yaml
VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://YOUR_PUBLIC_IP:3000/api}
```

3. **Agent Service URLs**:
```yaml
FRONTEND_URL: ${FRONTEND_URL:-http://YOUR_PUBLIC_IP:5173}
BACKEND_URL: ${BACKEND_URL:-http://YOUR_PUBLIC_IP:3000}
```

**Save and exit**: `Ctrl+X`, `Y`, `Enter`

---

## Step 7: Deploy! (5 minutes)

```bash
# Make sure you're in the project directory
cd ~/hostly

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs (if needed)
docker compose logs -f
```

**Wait 2-3 minutes** for all containers to start.

---

## Step 8: Verify Deployment (5 minutes)

### Check if services are running:

```bash
# Check all containers
docker compose ps

# Should show all services as "Up"
```

### Test endpoints:

1. **Backend**: Open browser → `http://YOUR_PUBLIC_IP:3000/api`
   - Should return: `{"message":"Hostly API"}` or similar

2. **Frontend**: Open browser → `http://YOUR_PUBLIC_IP:5173`
   - Should show your application

3. **Agent Service**: `http://YOUR_PUBLIC_IP:8000/docs`
   - Should show FastAPI documentation

### Check logs if something fails:

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs agent-service
docker compose logs mongodb
docker compose logs kafka
```

---

## Step 9: Set Up Domain (Optional - 10 minutes)

### Option A: Use Public IP (Quickest)
- Your app is already accessible at `http://YOUR_PUBLIC_IP:5173`
- Share this URL for your project demo

### Option B: Use Domain Name

1. **Get a free domain**:
   - Freenom: https://www.freenom.com/ (free .tk, .ml domains)
   - Or use any domain registrar

2. **Point domain to EC2**:
   - Go to your domain registrar
   - Add A record:
     - Name: `@` (or `www`)
     - Type: `A`
     - Value: `YOUR_PUBLIC_IP`
     - TTL: 3600

3. **Update CORS_ORIGIN** in `.env`:
   ```env
   CORS_ORIGIN=http://yourdomain.com
   VITE_API_BASE_URL=http://yourdomain.com:3000/api
   ```

4. **Restart services**:
   ```bash
   docker compose down
   docker compose up -d
   ```

---

## Step 10: Set Up SSL/HTTPS (Optional - 15 minutes)

For production, you should use HTTPS:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Install Nginx (as reverse proxy)
sudo apt install nginx -y

# Stop Nginx temporarily
sudo systemctl stop nginx

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Configure Nginx (create config file)
sudo nano /etc/nginx/sites-available/hostly
```

**Add this configuration**:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Agent Service
    location /agent {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Enable and restart**:

```bash
sudo ln -s /etc/nginx/sites-available/hostly /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Common Issues & Solutions

### Issue: Can't connect via SSH
- **Solution**: Check security group allows SSH (port 22) from your IP
- **Solution**: Verify you're using the correct key file

### Issue: Containers won't start
- **Solution**: Check logs: `docker compose logs`
- **Solution**: Verify `.env` file exists and has correct values
- **Solution**: Check disk space: `df -h`

### Issue: Can't access application in browser
- **Solution**: Check security group allows HTTP (80), HTTPS (443), and custom ports
- **Solution**: Verify containers are running: `docker compose ps`
- **Solution**: Check if port is correct: `netstat -tulpn | grep 5173`

### Issue: MongoDB connection error
- **Solution**: Wait 1-2 minutes for MongoDB to fully start
- **Solution**: Check MongoDB logs: `docker compose logs mongodb`
- **Solution**: Verify MONGODB_URI in .env is correct

### Issue: Out of memory
- **Solution**: Use larger instance (t3.medium or t3.large)
- **Solution**: Or reduce number of services running

---

## Useful Commands

```bash
# View all running containers
docker compose ps

# View logs
docker compose logs -f                    # All services
docker compose logs -f backend            # Specific service

# Restart a service
docker compose restart backend

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Rebuild and restart
docker compose up -d --build

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## Cost Estimate

- **t3.medium instance**: ~$30/month (or $0.0416/hour)
- **t2.micro (free tier)**: FREE for first 12 months, then ~$8/month
- **Data transfer**: First 100 GB free, then ~$0.09/GB
- **Storage (30 GB)**: ~$3/month

**Total**: ~$10-35/month depending on instance type

---

## Next Steps

1. ✅ Your app is now live!
2. ✅ Share the URL: `http://YOUR_PUBLIC_IP:5173`
3. ✅ Take screenshots for your project documentation
4. ✅ Document the deployment process
5. ✅ Set up monitoring (optional): Use CloudWatch or UptimeRobot

---

## Security Reminders

⚠️ **Important**:
- Change default passwords
- Don't expose MongoDB/Kafka ports to internet (only to your IP)
- Use strong session secrets
- Regularly update Docker images
- Set up firewall rules properly
- Consider using AWS Secrets Manager for sensitive data

---

## Need Help?

- Check logs: `docker compose logs`
- AWS EC2 Console: https://console.aws.amazon.com/ec2/
- Docker Compose docs: https://docs.docker.com/compose/

**You're all set! 🚀**

