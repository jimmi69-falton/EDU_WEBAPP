# 📚 EDU WEB - Hệ thống học tập trực tuyến

> **Hệ thống học tập trực tuyến với AI Chatbot và quản trị tiến trình học tập**

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-green)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Integrated-purple)](https://ai.google.dev/)

## ✨ Tính năng chính

### 🎯 **Core Features**
- 🔐 **Authentication** - Đăng nhập/đăng ký với phân quyền (Admin/Teacher/Student)
- 📊 **Dashboard** - Theo dõi tiến trình học tập, thành tích, thời gian học
- 📚 **Lesson Management** - Quản lý bài học với video YouTube và checkpoint
- ✅ **Checkpoint System** - Câu hỏi kiểm tra trong video (anti-skip)
- 📝 **Quiz System** - Quiz cuối bài với AI hỗ trợ
- 📋 **Assignments** - Bài tập trên lớp và về nhà
- 🔔 **Calendar** - Lịch học và sự kiện
- ⏱️ **Study Time Tracking** - Theo dõi thời gian học tập
- 🤖 **AI Health Assistant** - Chatbot tư vấn học tập với Gemini AI

### 👥 **Roles**

#### 1. Admin
- Quản lý người dùng và phân quyền
- Quản lý lịch hệ thống
- Xem thống kê tổng thể

#### 2. Teacher
- Tạo và quản lý bài học
- Thêm checkpoint vào video
- Tạo quiz cuối bài
- Tạo bài tập (classwork/homework)
- Theo dõi tiến trình học sinh

#### 3. Student
- Học video với checkpoint (anti-skip)
- Làm quiz cuối bài
- Theo dõi tiến trình học (%)
- Nhận sao (achievement): 5% = 1 sao
- Tracking study time
- Chatbot hỗ trợ học tập

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone và start
git clone <repository-url>
cd edu-webapp

# Start với Docker
./start.sh
```

### Option 2: Manual Setup
```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Data fetching & caching
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Router** - Navigation
- **Heroicons** - Icon library

### Backend
- **Java 21** - Programming language
- **Spring Boot 3.5.7** - Application framework
- **Spring Data JPA** - Data persistence
- **PostgreSQL (Neon)** - Database
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication
- **Maven** - Build tool

### AI & External Services
- **Google Gemini API** - AI chatbot
- **WebFlux** - Reactive HTTP client

## 📋 Demo Accounts

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@edu.com | admin123 | Admin | Quản trị viên |
| teacher@edu.com | teacher123 | Teacher | Giáo viên |
| student@edu.com | student123 | Student | Học sinh |

## 🏥 API Endpoints

### Auth
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký (admin only)

### Lessons
- `GET /api/lessons` - Lấy tất cả bài học
- `GET /api/lessons/:id` - Lấy bài học theo ID
- `POST /api/lessons/teacher` - Tạo bài học (teacher)
- `PUT /api/lessons/teacher/:id` - Cập nhật bài học (teacher)
- `DELETE /api/lessons/teacher/:id` - Xóa bài học (teacher)

### Checkpoints
- `GET /api/lessons/:id/checkpoints` - Lấy checkpoints của bài học
- `POST /api/lessons/:id/checkpoints` - Tạo checkpoint (teacher)
- `PUT /api/lessons/:lessonId/checkpoints/:id` - Cập nhật checkpoint (teacher)
- `DELETE /api/lessons/:lessonId/checkpoints/:id` - Xóa checkpoint (teacher)

### Quiz
- `GET /api/lessons/:id/quiz` - Lấy quiz của bài học
- `POST /api/lessons/:id/quiz` - Tạo quiz (teacher)
- `PUT /api/lessons/:lessonId/quiz/:id` - Cập nhật quiz (teacher)
- `DELETE /api/lessons/:lessonId/quiz/:id` - Xóa quiz (teacher)

### Progress
- `GET /api/student/lessons/progress` - Lấy tiến trình của học sinh
- `GET /api/student/lessons/:id/progress` - Lấy tiến trình bài học
- `POST /api/student/lessons/:id/progress` - Cập nhật tiến trình
- `GET /api/teacher/lessons/:id/progress` - Xem tiến trình học sinh (teacher)

### Assignments
- `GET /api/student/assignments` - Lấy assignments cho học sinh
- `GET /api/teacher/assignments` - Lấy assignments của teacher
- `POST /api/teacher/assignments` - Tạo assignment (teacher)
- `POST /api/student/assignments/:id/submit` - Nộp bài (student)

### Study Time
- `POST /api/student/study/start` - Bắt đầu học
- `POST /api/student/study/stop` - Dừng học
- `GET /api/student/study/stats` - Thống kê học tập

### Calendar
- `GET /api/calendar` - Lấy tất cả events
- `POST /api/calendar` - Tạo event cá nhân
- `POST /api/admin/calendar` - Tạo event hệ thống (admin)
- `PUT /api/calendar/:id` - Cập nhật event
- `DELETE /api/calendar/:id` - Xóa event

### AI Chatbot
- `POST /api/ai/chat` - Chat với AI

### Admin
- `GET /api/admin/users` - Lấy tất cả users (admin)
- `DELETE /api/admin/users/:id` - Xóa user (admin)

## 📁 Cấu trúc thư mục

```
edu-webapp/
├── backend/
│   ├── src/main/java/com/hrmanagement/
│   │   ├── controller/        # Controllers cho các endpoints
│   │   ├── model/             # Entities: User, Lesson, Checkpoint, Quiz, etc.
│   │   ├── repository/        # JPA Repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # JWT & Security
│   │   └── config/            # Configuration
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql           # Seed data
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/        # Sidebar, Topbar
│   │   │   ├── VideoPlayer/  # Video player với checkpoint
│   │   │   └── UI/            # Button, Card, Modal, LoadingSpinner
│   │   ├── pages/
│   │   │   ├── Dashboard/     # Dashboard
│   │   │   ├── Lessons/       # Danh sách và chi tiết bài học
│   │   │   ├── Assignments/   # Bài tập
│   │   │   ├── Calendar/      # Lịch học
│   │   │   ├── StudyTime/     # Theo dõi thời gian học
│   │   │   ├── Teacher/       # Teacher portal
│   │   │   ├── Admin/         # Admin portal
│   │   │   └── AI/            # Chatbot
│   │   ├── contexts/          # AuthContext, ThemeContext, etc.
│   │   └── utils/             # API, helpers
│   └── package.json
└── docker-compose.yml
```

## 🎨 Design System

### Color Palette
- **Primary (Education Blue)**: `#1E88E5`, `#1565C0`, `#2D9CDB`
- **Accent (Success Green)**: `#27AE60`, `#2ECC71`
- **Neutral**: `#F9FAFB`, `#F2F6F9`, `#E8EEF2`
- **Text**: `#1E293B`, `#64748B`, `#94A3B8`
- **Status**: Success `#22C55E`, Warning `#FACC15`, Danger `#EF4444`, Info `#3B82F6`

## 🔑 Quy tắc hoạt động

1. **Tiến trình tổng** = Trung bình tiến trình các bài học
2. **5% → 1 SAO** (Achievement)
3. **Video checkpoint** bắt buộc pause khi đến checkpoint
4. **Không cho tua video** (anti-skip) cho học sinh
5. **Quiz có AI explain** + AI suggestion
6. **Study time** ghi log khi stop
7. **Teacher** chỉ xem học sinh lớp mình
8. **Admin** nhìn được toàn hệ thống

## 🚀 Deployment

```bash
# Build production
cd frontend && npm run build
cd backend && mvn clean package

# Run with Docker
docker-compose up -d
```

## 📞 Support

EDU WEB là hệ thống học tập trực tuyến với mục đích giáo dục. AI chatbot hỗ trợ học tập nhưng không thay thế giáo viên.

---

**© 2024 EDU WEB. Made with ❤️**
