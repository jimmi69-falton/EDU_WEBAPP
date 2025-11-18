#!/bin/bash

# HR Management System Stop Script
echo "🛑 Stopping HR Management System..."

# Check if running with Docker
if command -v docker-compose &> /dev/null && [ -f docker-compose.yml ]; then
    if [ "$(docker-compose ps -q)" ]; then
        echo "📦 Stopping Docker services..."
        docker-compose down
        echo "✅ Docker services stopped"
    fi
fi

# Stop manual processes
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "🔧 Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "🎨 Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm .frontend.pid
fi

# Kill any remaining processes
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "npm start" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo "✅ All services stopped successfully!"

