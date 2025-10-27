#!/bin/bash

# Hostly AI Integration Setup Script
echo "🚀 Setting up Hostly AI Integration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in backend directory"
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Check for .env file
cd ../backend
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found in backend directory"
    echo "📝 Creating .env template..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hostly_db

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
EOF
    echo "✅ .env template created"
    echo "🔑 Please update the .env file with your actual values:"
    echo "   - Database credentials"
    echo "   - OpenAI API key"
    echo "   - Session secret"
else
    echo "✅ .env file found"
fi

# Check for OpenAI API key
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  Please update your OpenAI API key in the .env file"
    echo "🔗 Get your API key from: https://platform.openai.com/api-keys"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with actual values"
echo "2. Get an OpenAI API key from https://platform.openai.com/api-keys"
echo "3. Start the backend server: cd backend && npm run dev"
echo "4. Start the frontend server: cd frontend && npm run dev"
echo ""
echo "📖 For detailed instructions, see AI_INTEGRATION_GUIDE.md"
echo ""
echo "🤖 AI Features available:"
echo "   - AI Concierge for travel planning"
echo "   - AI property recommendations"
echo "   - AI pricing suggestions"
echo "   - AI content generation"
echo "   - AI search assistant"
