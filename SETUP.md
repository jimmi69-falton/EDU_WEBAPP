# Health Manager - Setup Guide

## 📋 Yêu cầu hệ thống

### Backend
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Frontend
- Node.js 18+
- npm 8+

### AI Integration (Optional)
- Google Gemini API Key

## 🚀 Cài đặt và chạy

### 1. Chuẩn bị Database

```sql
-- Tạo database
CREATE DATABASE health_manager;

-- Tạo user
CREATE USER 'healthuser'@'localhost' IDENTIFIED BY 'healthpass';
GRANT ALL PRIVILEGES ON health_manager.* TO 'healthuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Cấu hình Backend

```bash
cd backend

# Cập nhật application.properties với thông tin database
```

**Cập nhật `application.properties`:**
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/health_manager
spring.datasource.username=healthuser
spring.datasource.password=healthpass

# Gemini AI (optional)
gemini.api.key=your_gemini_api_key_here
```

### 3. Chạy Backend

```bash
cd backend

# Cài đặt dependencies
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 4. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install
```

### 5. Chạy Frontend

```bash
cd frontend

# Chạy development server
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 🐳 Chạy với Docker

```bash
# Tạo file .env từ template
cp environment-example.txt .env

# Cập nhật GEMINI_API_KEY trong .env (optional)

# Chạy toàn bộ hệ thống
docker-compose up -d

# Xem logs
docker-compose logs -f
```

## 👥 Tài khoản demo

| Email | Password | Mô tả |
|-------|----------|-------|
| admin@company.com | admin123 | Demo user |

## 🔧 Cấu hình Gemini AI (Optional)

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Cập nhật `GEMINI_API_KEY` trong file cấu hình

## 📁 Cấu trúc thư mục

```
health-manager/
├── backend/                # Spring Boot backend
│   ├── src/main/java/     # Java source code
│   ├── src/main/resources/# Configuration files + seed data
│   └── pom.xml            # Maven dependencies
├── frontend/              # React frontend
│   ├── src/               # React source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── styles/        # Design tokens
│   └── package.json       # NPM dependencies
└── docker-compose.yml     # Docker configuration
```

## 🔒 Bảo mật

- Simple authentication cho demo
- CORS configuration
- MySQL password hashing với BCrypt

## 🚨 Troubleshooting

### Backend không khởi động được
- Kiểm tra MySQL đã chạy chưa
- Xác nhận thông tin database trong `application.properties`
- Kiểm tra port 8080 có bị chiếm dụng không

### Frontend không kết nối được API
- Xác nhận backend đã chạy tại port 8080
- Kiểm tra CORS configuration
- Xem console browser để debug

### AI Chatbot không hoạt động
- Xác nhận `GEMINI_API_KEY` đã được cấu hình
- Kiểm tra API key còn hạn sử dụng
- Xem backend logs để debug

## 🎯 Tính năng

✅ **Hoàn thành:**
- 🔐 Authentication
- 📊 Dashboard với health metrics
- 💪 Fitness library
- 🔔 Smart reminders với calendar
- 🤖 AI Health chatbot
- 🌓 Light/Dark mode
- 📱 Responsive design

## 🔄 Cập nhật

```bash
# Pull latest changes
git pull origin main

# Update backend
cd backend && mvn clean install

# Update frontend  
cd frontend && npm install

# Restart services
docker-compose restart
```

---

**Health Manager - Your Personal Health Companion** 💚
