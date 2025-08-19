#!/bin/bash

# Development script for Form Builder Monorepo

echo "🔧 Starting Form Builder development environment..."

# Check if MongoDB is running
if ! docker ps | grep -q "form-builder-mongo"; then
    echo "🐳 Starting MongoDB..."
    npm run start:db
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 5
fi

# Start development servers
echo "🚀 Starting development servers..."
npm run dev