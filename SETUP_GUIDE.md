# Hostly - Manual Setup Guide

Complete step-by-step guide to manually set up and run the Hostly project.

## Prerequisites

Before starting, ensure you have:
- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **Python** (v3.12 or higher) - [Download](https://www.python.org/)
- ✅ **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- ✅ **Git** (to clone the repository)

---

## Step 1: Install MySQL and Create Database

### 1.1 Install MySQL (if not already installed)
```bash
# Windows: Download and install from https://dev.mysql.com/downloads/installer/
# Or use Chocolatey:
choco install mysql

# macOS:
brew install mysql
brew services start mysql

# Linux (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### 1.2 Start MySQL Service
```bash
# Windows: MySQL should start automatically, or use Services panel
# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

### 1.3 Connect to MySQL and Create Database
```bash
# Connect to MySQL (use your root password)
mysql -u root -p

# Once connected, run these SQL commands:
CREATE DATABASE hostly;
SHOW DATABASES;  # Verify database was created
EXIT;
```

**Note:** Remember your MySQL root password - you'll need it for the .env files!

---

## Step 2: Set Up Backend Service

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Backend .env File
Create a file named `.env` in the `backend` directory:

```bash
# Windows PowerShell:
New-Item -Path .env -ItemType File

# Or use any text editor to create backend/.env
```

### 2.4 Add Backend Environment Variables
Open `backend/.env` and add:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=hostly

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# AI Service (Groq API Key - Optional for basic features)
OPENAI_API_KEY=your_groq_api_key_here

# Kafka (Optional - leave empty if not using Kafka)
KAFKA_BROKER=
```

**Important:** Replace:
- `your_mysql_password_here` with your actual MySQL root password
- `your-super-secret-session-key-change-this-in-production` with a random secret string
- `your_groq_api_key_here` with your Groq API key (get from https://console.groq.com/)

### 2.5 Test Backend (Optional - to verify setup)
```bash
npm run dev
```

You should see: `Server is running on port 3000`
Press `Ctrl+C` to stop.

---

## Step 3: Set Up Agent Service (Python)

### 3.1 Navigate to Agent Service Directory
```bash
cd ../agent-service
```

### 3.2 Create Python Virtual Environment
```bash
# Windows:
python -m venv venv
venv\Scripts\activate

# macOS/Linux:
python3 -m venv venv
source venv/bin/activate
```

### 3.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3.4 Create Agent Service .env File
Create a file named `.env` in the `agent-service` directory:

```bash
# Windows PowerShell:
New-Item -Path .env -ItemType File

# Or use any text editor
```

### 3.5 Add Agent Service Environment Variables
Open `agent-service/.env` and add:

```env
# API Keys
OPENAI_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=hostly
DB_PORT=3306

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Agent Configuration (Optional)
AGENT_MODEL=gpt-4
AGENT_TEMPERATURE=0.7
MAX_SEARCH_RESULTS=5
```

**Important:** Replace:
- `your_groq_api_key_here` with your Groq API key
- `your_tavily_api_key_here` with your Tavily API key (get from https://tavily.com/) - Optional
- `your_mysql_password_here` with your MySQL root password

---

## Step 4: Set Up Frontend Service

### 4.1 Navigate to Frontend Directory
```bash
cd ../frontend
```

### 4.2 Install Dependencies
```bash
npm install
```

### 4.3 Create Frontend .env File
Create a file named `.env.local` in the `frontend` directory:

```bash
# Windows PowerShell:
New-Item -Path .env.local -ItemType File

# Or use any text editor
```

### 4.4 Add Frontend Environment Variables
Open `frontend/.env.local` and add:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Step 5: Run All Services

You'll need **3 terminal windows** (or use a terminal multiplexer like tmux/screen).

### Terminal 1: Backend Service
```bash
cd backend
npm run dev
```

**Expected output:**
```
Server is running on port 3000
Database connection established successfully.
```

### Terminal 2: Agent Service
```bash
cd agent-service
# Activate virtual environment first
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Then run:
python -m uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 3: Frontend Service
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 6: Verify Everything is Working

### 6.1 Check Backend
Open browser: http://localhost:3000/api/auth/me
Should return: `{"message": "Not authenticated"}` (this is normal)

### 6.2 Check Agent Service
Open browser: http://localhost:8000
Should return: `{"message": "Hostly AI Travel Agent Service", ...}`

Open browser: http://localhost:8000/docs
Should show FastAPI interactive documentation

### 6.3 Check Frontend
Open browser: http://localhost:5173
Should show the Hostly landing page

---

## Troubleshooting

### Database Connection Issues

**Error:** `Unable to connect to the database`

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # Windows: Check Services panel
   # macOS:
   brew services list | grep mysql
   
   # Linux:
   sudo systemctl status mysql
   ```

2. Verify database exists:
   ```bash
   mysql -u root -p
   SHOW DATABASES;  # Should see 'hostly'
   ```

3. Check credentials in `.env` file match your MySQL setup

### Port Already in Use

**Error:** `Port 3000/5173/8000 is already in use`

**Solutions:**
1. Find and kill the process:
   ```bash
   # Windows:
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux:
   lsof -ti:3000 | xargs kill -9
   ```

2. Or change the port in `.env` files

### Python Virtual Environment Issues

**Error:** `python: command not found`

**Solutions:**
1. Use `python3` instead of `python`:
   ```bash
   python3 -m venv venv
   ```

2. Make sure Python is installed:
   ```bash
   python --version  # or python3 --version
   ```

### Module Not Found Errors

**Backend:**
```bash
cd backend
rm -rf node_modules
npm install
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Agent Service:**
```bash
cd agent-service
pip install -r requirements.txt
```

---

## Quick Reference: All Commands

### Start All Services (3 terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Agent Service:**
```bash
cd agent-service
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # macOS/Linux
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Stop Services
Press `Ctrl+C` in each terminal

---

## Next Steps

1. ✅ All services running
2. ✅ Open http://localhost:5173 in your browser
3. ✅ Create an account (Sign Up)
4. ✅ Test the application!

---

## Notes

- **Kafka is optional** - The app will work without it (booking events just won't be processed asynchronously)
- **Tavily API is optional** - Agent service will work with just Groq API key
- **Database tables are auto-created** - Sequelize will create tables on first run
- **Session storage** - Uses MySQL sessions table (auto-created)

---

## Getting API Keys

1. **Groq API Key:**
   - Visit: https://console.groq.com/
   - Sign up / Login
   - Go to API Keys section
   - Create a new API key
   - Copy and paste into `.env` files

2. **Tavily API Key (Optional):**
   - Visit: https://tavily.com/
   - Sign up for free account
   - Get API key from dashboard
   - Add to `agent-service/.env`

---

**Happy Coding! 🚀**

