#!/bin/bash

# EDU WEB System Startup Script
echo "🚀 Starting EDU WEB System..."

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "📦 Docker detected. Starting with Docker Compose..."
    
    # Start services (without MySQL since we use Neon PostgreSQL)
    docker-compose up -d backend frontend
    
    echo "✅ Services started successfully!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:8080"
    echo ""
    echo "📋 Demo Accounts:"
    echo "   Admin: admin@edu.com / admin123"
    echo "   Teacher: teacher@edu.com / teacher123"
    echo "   Student: student@edu.com / student123"
    
else
    echo "🔧 Docker not found. Starting manually..."
    
    # Start Backend
    echo "🔧 Starting Backend (Spring Boot)..."
    cd backend
    if [ ! -f target/hr-backend-0.0.1-SNAPSHOT.jar ]; then
        echo "📦 Building backend..."
        ./mvnw clean install -DskipTests || mvn clean install -DskipTests
    fi
    
    ./mvnw spring-boot:run > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    sleep 15
    
    # Check if backend started successfully
    if curl -s http://localhost:8080/api/health > /dev/null; then
        echo "✅ Backend started successfully!"
    else
        echo "⚠️  Backend may still be starting. Check logs: tail -f backend.log"
    fi
    
    # Start Frontend
    echo "🎨 Starting Frontend (React)..."
    cd frontend
    if [ ! -d node_modules ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    echo "✅ Services started successfully!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:8080"
    echo ""
    echo "📋 Demo Accounts:"
    echo "   Admin: admin@edu.com / admin123"
    echo "   Teacher: teacher@edu.com / teacher123"
    echo "   Student: student@edu.com / student123"
    echo ""
    echo "🛑 To stop services:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    echo "   or run: ./stop.sh"
    
    # Save PIDs for stop script
    echo "$BACKEND_PID" > .backend.pid
    echo "$FRONTEND_PID" > .frontend.pid
fi

echo ""
echo "🎉 EDU WEB System is now running!"
echo "📚 Check QUICK_START.md for quick guide"
echo "📚 Check DEPLOY.md for detailed documentation"
