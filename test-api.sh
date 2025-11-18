#!/bin/bash

# 🧪 Script test API cho EDU WEB
# Usage: ./test-api.sh

API_URL="http://localhost:8080/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing EDU WEB API..."
echo "================================"

# 1. Health Check
echo -e "\n${YELLOW}1. Health Check${NC}"
HEALTH=$(curl -s "$API_URL/health")
if [[ $HEALTH == *"UP"* ]]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $HEALTH"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $HEALTH"
    exit 1
fi

# 2. Login as Admin
echo -e "\n${YELLOW}2. Login as Admin${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edu.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Admin login failed${NC}"
    echo "Response: $ADMIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Admin login successful${NC}"
    echo "Token: ${ADMIN_TOKEN:0:50}..."
fi

# 3. Login as Teacher
echo -e "\n${YELLOW}3. Login as Teacher${NC}"
TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@edu.com",
    "password": "teacher123"
  }')

TEACHER_TOKEN=$(echo $TEACHER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TEACHER_TOKEN" ]; then
    echo -e "${RED}❌ Teacher login failed${NC}"
    echo "Response: $TEACHER_RESPONSE"
else
    echo -e "${GREEN}✅ Teacher login successful${NC}"
    echo "Token: ${TEACHER_TOKEN:0:50}..."
fi

# 4. Login as Student
echo -e "\n${YELLOW}4. Login as Student${NC}"
STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@edu.com",
    "password": "student123"
  }')

STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$STUDENT_TOKEN" ]; then
    echo -e "${RED}❌ Student login failed${NC}"
    echo "Response: $STUDENT_RESPONSE"
else
    echo -e "${GREEN}✅ Student login successful${NC}"
    echo "Token: ${STUDENT_TOKEN:0:50}..."
fi

# 5. Get Lessons (as Student)
echo -e "\n${YELLOW}5. Get Lessons (as Student)${NC}"
LESSONS=$(curl -s -X GET "$API_URL/lessons" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if [[ $LESSONS == *"[]"* ]] || [[ $LESSONS == *"id"* ]]; then
    echo -e "${GREEN}✅ Get lessons successful${NC}"
    echo "Response: $(echo $LESSONS | head -c 200)..."
else
    echo -e "${RED}❌ Get lessons failed${NC}"
    echo "Response: $LESSONS"
fi

# 6. Create Lesson (as Teacher)
echo -e "\n${YELLOW}6. Create Lesson (as Teacher)${NC}"
NEW_LESSON=$(curl -s -X POST "$API_URL/lessons/teacher" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lesson",
    "description": "This is a test lesson",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "totalDurationSeconds": 3600
  }')

LESSON_ID=$(echo $NEW_LESSON | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$LESSON_ID" ]; then
    echo -e "${RED}❌ Create lesson failed${NC}"
    echo "Response: $NEW_LESSON"
else
    echo -e "${GREEN}✅ Create lesson successful${NC}"
    echo "Lesson ID: $LESSON_ID"
fi

# 7. Get Study Stats (as Student)
echo -e "\n${YELLOW}7. Get Study Stats (as Student)${NC}"
STATS=$(curl -s -X GET "$API_URL/student/study/stats" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if [[ $STATS == *"todayMinutes"* ]] || [[ $STATS == *"totalHours"* ]]; then
    echo -e "${GREEN}✅ Get study stats successful${NC}"
    echo "Response: $STATS"
else
    echo -e "${RED}❌ Get study stats failed${NC}"
    echo "Response: $STATS"
fi

# 8. Get Calendar Events
echo -e "\n${YELLOW}8. Get Calendar Events${NC}"
EVENTS=$(curl -s -X GET "$API_URL/calendar" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if [[ $EVENTS == *"[]"* ]] || [[ $EVENTS == *"id"* ]]; then
    echo -e "${GREEN}✅ Get calendar events successful${NC}"
    echo "Response: $(echo $EVENTS | head -c 200)..."
else
    echo -e "${RED}❌ Get calendar events failed${NC}"
    echo "Response: $EVENTS"
fi

echo -e "\n================================"
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Login with one of the demo accounts"
echo "3. Test the frontend features"

