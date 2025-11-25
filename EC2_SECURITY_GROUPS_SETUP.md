# EC2 Instance Setup with Security Groups Configuration

This guide provides step-by-step instructions for creating an EC2 instance with the configured security groups for your Hostly application.

## Security Groups Configuration

### Security Group 1: Application Services (`hostly-app-sg`)

This security group is for your main application services (Frontend, Backend, Agent).

| Type | Protocol | Port Range | Source Type | Source | Description |
|------|----------|------------|-------------|--------|-------------|
| SSH | TCP | 22 | My IP | 76.102.15.113/32 | SSH access from your IP |
| Custom TCP | TCP | 3000 | Anywhere | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 5173 | Anywhere | 0.0.0.0/0 | Frontend |
| Custom TCP | TCP | 8000 | Anywhere | 0.0.0.0.0/0 | Agent Service |

### Security Group 2: Database & Infrastructure (`hostly-db-sg`)

This security group is for your database and messaging infrastructure services.

| Type | Protocol | Port Range | Source Type | Source | Description |
|------|----------|------------|-------------|--------|-------------|
| Custom TCP | TCP | 27017 | Anywhere | 0.0.0.0/0 | MongoDB |
| Custom TCP | TCP | 9092 | Anywhere | 0.0.0.0/0 | Kafka |
| Custom TCP | TCP | 8081 | Anywhere | 0.0.0.0/0 | Mongo Express |
| Custom TCP | TCP | 2181 | Anywhere | 0.0.0.0/0 | Zookeeper |

---

## Step-by-Step: Create EC2 Instance

### Step 1: Create Security Groups

#### Create Security Group 1: Application Services

1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2/
2. **Navigate to Security Groups**: Left sidebar → **Network & Security** → **Security Groups**
3. **Click "Create security group"**
4. **Configure Basic Details**:
   - **Security group name**: `hostly-app-sg`
   - **Description**: `Security group for Hostly application services (Frontend, Backend, Agent)`
   - **VPC**: Select your default VPC (or create a new one if needed)

5. **Add Inbound Rules**:
   - Click **"Add rule"** for each rule below:

   **Rule 1: SSH**
   - **Type**: SSH
   - **Protocol**: TCP
   - **Port range**: 22
   - **Source type**: Custom
   - **Source**: `76.102.15.113/32` (or select "My IP" if available)
   - **Description**: SSH

   **Rule 2: Backend**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 3000
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: Backend

   **Rule 3: Frontend**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 5173
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: Frontend

   **Rule 4: Agent Service**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 8000
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: agent

6. **Outbound Rules**: Leave default (Allow all traffic)

7. **Click "Create security group"**

#### Create Security Group 2: Database & Infrastructure

1. **Click "Create security group"** again
2. **Configure Basic Details**:
   - **Security group name**: `hostly-db-sg`
   - **Description**: `Security group for Hostly database and infrastructure services`
   - **VPC**: Same VPC as above

3. **Add Inbound Rules**:

   **Rule 1: MongoDB**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 27017
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: mongodb

   **Rule 2: Kafka**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 9092
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: kafka

   **Rule 3: Mongo Express**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 8081
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: mongo-express

   **Rule 4: Zookeeper**
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 2181
   - **Source type**: Anywhere-IPv4
   - **Source**: `0.0.0.0/0`
   - **Description**: zookeeper

4. **Outbound Rules**: Leave default

5. **Click "Create security group"**

---

### Step 2: Launch EC2 Instance

1. **Go to EC2 Console** → **Instances** → **Launch Instance**

2. **Name and tags**:
   - **Name**: `hostly-app`

3. **Application and OS Images (AMI)**:
   - Search for: `Ubuntu Server 22.04 LTS`
   - Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
   - Make sure it's **Free tier eligible** if you want to save costs

4. **Instance type**:
   - **Recommended**: `t3.medium` (2 vCPU, 4 GB RAM)
   - **For testing/learning**: `t2.micro` (1 vCPU, 1 GB RAM) - **Free tier eligible**
   - **For production**: `t3.large` (2 vCPU, 8 GB RAM) or larger
   - ⚠️ **Note**: `t2.micro` may be slow with all services running

5. **Key pair (login)**:
   - **Option A**: Select existing key pair (if you have one)
   - **Option B**: Create new key pair:
     - Click **"Create new key pair"**
     - **Name**: `hostly-key`
     - **Key pair type**: RSA
     - **Private key file format**: `.pem` (for Linux/Mac) or `.ppk` (for Windows PuTTY)
     - Click **"Create key pair"**
     - **⚠️ IMPORTANT**: Download and save the key file securely! You won't be able to download it again.

6. **Network settings**:
   - **VPC**: Select the same VPC where you created security groups
   - **Subnet**: Select any public subnet (or create new)
   - **Auto-assign Public IP**: **Enable**
   - **Firewall (security groups)**: 
     - Select **"Select existing security group"**
     - **Common security groups**: Select both:
       - `hostly-app-sg`
       - `hostly-db-sg`
     - Or you can attach them later

7. **Configure storage**:
   - **Size (GiB)**: `30` (minimum recommended)
   - **Volume type**: `gp3` (General Purpose SSD)
   - **Delete on termination**: Uncheck if you want to keep data after instance termination

8. **Advanced details** (Optional):
   - You can add user data script here for automatic setup (see below)

9. **Summary**:
   - Review all settings
   - **Number of instances**: 1
   - **Click "Launch instance"**

10. **Wait for instance to start**:
    - Status will change from "Pending" to "Running" (takes 1-2 minutes)
    - Click on the instance ID to view details
    - **Copy the "Public IPv4 address"** (e.g., `54.123.45.67`)
    - **Copy the "Public IPv4 DNS"** (e.g., `ec2-54-123-45-67.compute-1.amazonaws.com`)

---

### Step 3: Attach Security Groups (If Not Done During Launch)

If you didn't attach both security groups during launch:

1. **Select your instance** in EC2 Console
2. **Actions** → **Security** → **Change security groups**
3. **Select both security groups**:
   - `hostly-app-sg`
   - `hostly-db-sg`
4. **Click "Save"**

---

### Step 4: Connect to Your Instance

#### Windows (PowerShell):

```powershell
# Navigate to where you saved the key file
cd C:\Users\YourName\Downloads

# Set permissions (if needed)
icacls hostly-key.pem /inheritance:r
icacls hostly-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect (replace YOUR_PUBLIC_IP with your actual IP)
ssh -i hostly-key.pem ubuntu@YOUR_PUBLIC_IP
```

#### Windows (PuTTY - If you have .ppk file):

1. **Download PuTTY**: https://www.putty.org/
2. **Open PuTTY**
3. **Configure**:
   - **Host Name**: `ubuntu@YOUR_PUBLIC_IP`
   - **Connection** → **SSH** → **Auth** → **Credentials**
   - **Private key file for authentication**: Browse and select your `.ppk` file
4. **Click "Open"**

#### Alternative: AWS Systems Manager Session Manager (No SSH Key Needed):

1. **Go to EC2 Console** → Select your instance
2. **Click "Connect"**
3. **Choose "Session Manager" tab**
4. **Click "Connect"**
5. A browser-based terminal will open

---

### Step 5: Install Docker and Docker Compose

Once connected to your instance, run:

```bash
# Update system packages
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

### Step 6: Upload Your Code

#### Option A: Using Git (Recommended)

```bash
# Install Git
sudo apt install git -y

# Clone your repository
git clone YOUR_REPO_URL
cd Hostly
```

#### Option B: Using SCP (From Windows PowerShell)

```powershell
# From your local machine (PowerShell)
# Navigate to your project folder
cd "C:\Users\Jenil Savalia\Desktop\Hostly LAB2\Hostly"

# Upload entire project (replace with your IP and key path)
scp -i C:\path\to\hostly-key.pem -r * ubuntu@YOUR_PUBLIC_IP:~/hostly
```

#### Option C: Using WinSCP (GUI - Easiest for Windows)

1. **Download WinSCP**: https://winscp.net/
2. **Open WinSCP**
3. **New Session**:
   - **File protocol**: SFTP
   - **Host name**: `YOUR_PUBLIC_IP`
   - **User name**: `ubuntu`
   - **Private key file**: Browse and select your `.ppk` or `.pem` file
   - **Click "Login"**
4. **Drag and drop** your project folder to the server

---

### Step 7: Create Environment File

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

# Frontend
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

### Step 8: Update docker-compose.yml

Edit the docker-compose.yml to use your EC2 public IP:

```bash
nano docker-compose.yml
```

**Update these sections**:

1. **Backend CORS_ORIGIN** (around line 61):
```yaml
CORS_ORIGIN: http://YOUR_PUBLIC_IP:5173
```

2. **Frontend VITE_API_BASE_URL** (around line 114):
```yaml
VITE_API_BASE_URL: http://YOUR_PUBLIC_IP:3000/api
```

3. **Agent Service URLs** (around lines 94-95):
```yaml
FRONTEND_URL: http://YOUR_PUBLIC_IP:5173
BACKEND_URL: http://YOUR_PUBLIC_IP:3000
```

**Save and exit**: `Ctrl+X`, `Y`, `Enter`

---

### Step 9: Deploy!

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

### Step 10: Verify Deployment

#### Check if services are running:

```bash
# Check all containers
docker compose ps

# Should show all services as "Up"
```

#### Test endpoints:

1. **Backend**: Open browser → `http://YOUR_PUBLIC_IP:3000/api`
   - Should return: `{"message":"Hostly API"}` or similar

2. **Frontend**: Open browser → `http://YOUR_PUBLIC_IP:5173`
   - Should show your application

3. **Agent Service**: `http://YOUR_PUBLIC_IP:8000/docs`
   - Should show FastAPI documentation

4. **Mongo Express**: `http://YOUR_PUBLIC_IP:8081`
   - Should show MongoDB web interface

#### Check logs if something fails:

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

## Security Recommendations

⚠️ **Important Security Notes**:

1. **SSH Access**: Your SSH rule (port 22) is restricted to your IP (`76.102.15.113/32`). This is good! However, if your IP changes, you'll need to update the security group.

2. **Database Ports**: Currently, MongoDB (27017), Kafka (9092), and Zookeeper (2181) are open to the internet (`0.0.0.0/0`). For production:
   - **Recommended**: Restrict these to only allow traffic from `hostly-app-sg` security group
   - **How to do it**:
     - Edit `hostly-db-sg` security group
     - Change source from `0.0.0.0/0` to `hostly-app-sg` (select the security group)
     - This way, only your application can access the database

3. **Mongo Express**: Port 8081 is open to the internet. Consider:
   - Restricting to your IP only
   - Or removing it in production (use MongoDB CLI instead)

4. **Update SSH IP**: If your IP address changes, update the SSH rule:
   - Go to Security Groups → `hostly-app-sg` → Edit inbound rules
   - Update the SSH rule source IP

---

## Quick Reference: Security Group Rules Summary

### `hostly-app-sg` (Application Services)
- **22/TCP** → `76.102.15.113/32` (SSH - Your IP)
- **3000/TCP** → `0.0.0.0/0` (Backend)
- **5173/TCP** → `0.0.0.0/0` (Frontend)
- **8000/TCP** → `0.0.0.0/0` (Agent Service)

### `hostly-db-sg` (Database & Infrastructure)
- **27017/TCP** → `0.0.0.0/0` (MongoDB) ⚠️ Consider restricting
- **9092/TCP** → `0.0.0.0/0` (Kafka) ⚠️ Consider restricting
- **8081/TCP** → `0.0.0.0/0` (Mongo Express) ⚠️ Consider restricting
- **2181/TCP** → `0.0.0.0/0` (Zookeeper) ⚠️ Consider restricting

---

## Troubleshooting

### Can't connect via SSH
- **Check**: Security group allows SSH (port 22) from your IP
- **Check**: Your IP hasn't changed (update security group if needed)
- **Check**: Instance is running
- **Check**: You're using the correct key file

### Can't access application in browser
- **Check**: Security groups allow the required ports
- **Check**: Containers are running: `docker compose ps`
- **Check**: Check logs: `docker compose logs`
- **Check**: Firewall on instance (should be handled by security groups)

### Containers won't start
- **Check**: Logs: `docker compose logs`
- **Check**: `.env` file exists and has correct values
- **Check**: Disk space: `df -h`
- **Check**: Memory: `free -h` (may need larger instance)

### MongoDB connection error
- **Check**: Wait 1-2 minutes for MongoDB to fully start
- **Check**: MongoDB logs: `docker compose logs mongodb`
- **Check**: Verify MONGODB_URI in .env is correct

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

1. ✅ Your app is now live at `http://YOUR_PUBLIC_IP:5173`
2. ✅ Share the URL for your project demo
3. ✅ Consider setting up a domain name (optional)
4. ✅ Set up SSL/HTTPS for production (optional)
5. ✅ Set up monitoring (CloudWatch or UptimeRobot)

---

**You're all set! 🚀**

