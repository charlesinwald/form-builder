#!/bin/bash

# Production build script for Form Builder Monorepo

echo "🏗️  Building Form Builder for production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..

# Build frontend
echo "🔧 Building frontend..."
npm run build:frontend

# Build backend
echo "🔧 Building backend..."
npm run build:backend

echo "✅ Build complete!"
echo "Frontend build: frontend/.next/"
echo "Backend binary: backend/bin/server"