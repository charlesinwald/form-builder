#!/bin/bash

# Form Builder Monorepo Setup Script

echo "🚀 Setting up Form Builder Monorepo..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from .env.example"
fi

# Build Go dependencies
echo "🔧 Installing Go dependencies..."
cd backend && go mod tidy && cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: npm run start:db"
echo "2. Start development servers: npm run dev"
echo "3. Visit http://localhost:3000 (frontend) and http://localhost:8080 (backend)"