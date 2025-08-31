#!/bin/bash

# Production backend build script for Form Builder Monorepo

echo "🏗️  Building backend for production..."

# Clean previous backend build
echo "🧹 Cleaning previous backend build..."
rm -rf backend/bin

# Build backend
echo "🔧 Building backend..."
cd backend && go build -o bin/server . && cd ..

if [ -f backend/bin/server ]; then
echo "✅ Backend build complete!"
echo "Backend binary: backend/bin/server"
else
echo "❌ Backend build failed."
exit 1
fi


