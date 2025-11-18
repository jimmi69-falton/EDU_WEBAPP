# ⚡ Quick Start Guide

## 🚀 Chạy nhanh hệ thống (3 bước)

### Bước 1: Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

**Hoặc nếu không có mvnw:**
```bash
cd backend
mvn spring-boot:run
```

Đợi đến khi thấy: `Started HrBackendApplication in X.XXX seconds`

### Bước 2: Start Frontend (Terminal mới)

```bash
cd frontend
npm install  # Chỉ lần đầu tiên
npm start
```

### Bước 3: Mở trình duyệt

```
http://localhost:3000
```

## 🔑 Tài khoản demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edu.com | admin123 |
| Teacher | teacher@edu.com | teacher123 |
| Student | student@edu.com | student123 |

## ✅ Kiểm tra nhanh

### Test Backend API:
```bash
curl http://localhost:8080/api/health
```

Kết quả mong đợi: `{"status":"UP","service":"edu-webapp"}`

### Test Authentication:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@edu.com","password":"student123"}'
```

### Chạy script test tự động:
```bash
./test-api.sh
```

## 🐛 Troubleshooting

### Port đã được sử dụng?
```bash
# Kill process trên port 8080
lsof -ti:8080 | xargs kill -9

# Kill process trên port 3000
lsof -ti:3000 | xargs kill -9
```

### Backend không start?
- Kiểm tra Java version: `java -version` (cần Java 17+)
- Kiểm tra Maven: `mvn -version`
- Xem logs để biết lỗi cụ thể

### Frontend không start?
- Xóa node_modules và cài lại: `rm -rf node_modules && npm install`
- Kiểm tra Node version: `node -version` (cần Node 18+)

### Database connection error?
- Kiểm tra Neon database đang hoạt động
- Kiểm tra connection string trong `application.properties`

## 📚 Tài liệu đầy đủ

Xem file `DEPLOY.md` để biết hướng dẫn chi tiết hơn.
