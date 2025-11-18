# 🚀 Hướng dẫn Deploy Production - EDU Web App

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn deploy ứng dụng lên mạng để chia sẻ với bạn bè. Chúng ta sẽ deploy:
- **Frontend** lên **Vercel** (miễn phí, tự động deploy từ GitHub)
- **Backend** lên **Railway** hoặc **Render** (miễn phí)
- **Database** đã có sẵn trên **Neon PostgreSQL**

---

## 🎯 Option 1: Deploy với Vercel + Railway (Khuyến nghị)

### Bước 1: Chuẩn bị GitHub Repository

1. **Tạo repository trên GitHub** (nếu chưa có):
   ```bash
   cd /Users/nguyenhoangkhanh/MY\ CODE/Web\ Dev/edu-webapp
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/edu-webapp.git
   git push -u origin main
   ```

2. **Tạo file `.gitignore`** (nếu chưa có):
   ```
   # Backend
   backend/target/
   backend/.mvn/
   backend/mvnw
   backend/mvnw.cmd
   backend/.idea/
   backend/*.log

   # Frontend
   frontend/node_modules/
   frontend/build/
   frontend/.env.local
   frontend/.env.development.local
   frontend/.env.test.local
   frontend/.env.production.local
   frontend/npm-debug.log*
   frontend/yarn-debug.log*
   frontend/yarn-error.log*

   # IDE
   .idea/
   .vscode/
   *.iml

   # OS
   .DS_Store
   Thumbs.db

   # Environment
   .env
   .env.local
   ```

---

### Bước 2: Deploy Backend lên Railway

#### 2.1. Tạo tài khoản Railway

1. Truy cập: https://railway.app
2. Đăng nhập bằng GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Chọn repository `edu-webapp`

#### 2.2. Cấu hình Backend trên Railway

1. Railway sẽ tự động detect Spring Boot project
2. **Settings** → **Root Directory**: Chọn `backend`
3. **Settings** → **Build Command**: `./mvnw clean package -DskipTests` (Sử dụng Maven Wrapper)
4. **Settings** → **Start Command**: `java -jar target/hr-backend-0.0.1-SNAPSHOT.jar`
   
   **Lưu ý**: 
   - File `railway.json` trong thư mục `backend` đã được cấu hình sẵn, Railway sẽ tự động đọc cấu hình từ đó
   - Maven Wrapper (`mvnw`) đã được tạo sẵn trong project, không cần cài Maven thủ công

#### 2.3. Cấu hình Environment Variables

Trong Railway, vào **Variables** và thêm:

```env
# Database (Neon PostgreSQL - đã có sẵn)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-orange-flower-a1d57mto-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=npg_iFk1qnmd9PHv
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver

# JWT
JWT_SECRET=day-la-mot-chuoi-bi-mat-rat-dai-va-an-toan-cho-hs512-ban-co-the-them-so-12345-va-ky-tu-dac-biet
JWT_EXPIRATION_MS=86400000

# Gemini AI
GEMINI_API_KEY=AIzaSyCgL2z1tKWjet65nyov1tSVXl2f6oCLIJA

# CORS (sẽ cập nhật sau khi có frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app

# JPA
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_SQL_INIT_MODE=always

# Server Port (Railway tự động set PORT)
SERVER_PORT=${PORT:8080}
```

#### 2.4. Lấy Backend URL

Sau khi deploy xong, Railway sẽ cung cấp một URL như: `https://your-app-name.up.railway.app`
**Lưu lại URL này** để dùng cho frontend!

---

### Bước 3: Deploy Frontend lên Vercel

#### 3.1. Tạo tài khoản Vercel

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **"Add New Project"**
4. Import repository `edu-webapp`

#### 3.2. Cấu hình Frontend trên Vercel

1. **Root Directory**: Chọn `frontend`
2. **Framework Preset**: `Create React App`
3. **Build Command**: `npm run build` (mặc định)
4. **Output Directory**: `build` (mặc định)

#### 3.3. Cấu hình Environment Variables

Trong Vercel, vào **Settings** → **Environment Variables** và thêm:

```env
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
```

**Lưu ý**: Thay `your-backend-url.up.railway.app` bằng URL backend từ Railway!

#### 3.4. Deploy

Click **"Deploy"** và đợi Vercel build xong. Sau đó bạn sẽ có URL frontend như: `https://edu-webapp.vercel.app`

---

### Bước 4: Cập nhật CORS trên Backend

Sau khi có frontend URL, quay lại Railway và cập nhật:

```env
CORS_ALLOWED_ORIGINS=https://edu-webapp.vercel.app
```

Sau đó **redeploy** backend để áp dụng thay đổi.

---

## 🎯 Option 2: Deploy với Vercel + Render (Alternative)

### Bước 1: Deploy Backend lên Render

#### 1.1. Tạo tài khoản Render

1. Truy cập: https://render.com
2. Đăng nhập bằng GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect repository `edu-webapp`

#### 1.2. Cấu hình Backend trên Render

- **Name**: `edu-webapp-backend`
- **Environment**: `Docker` hoặc `Maven`
- **Root Directory**: `backend`
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/hr-backend-0.0.1-SNAPSHOT.jar`
- **Instance Type**: `Free` (512 MB RAM)

#### 1.3. Environment Variables (giống Railway)

Thêm các biến môi trường như ở Railway.

#### 1.4. Lấy Backend URL

Render sẽ cung cấp URL như: `https://edu-webapp-backend.onrender.com`

---

### Bước 2: Deploy Frontend (giống Option 1)

Làm theo các bước ở **Bước 3** của Option 1, nhưng dùng Render backend URL.

---

## 🔧 Cập nhật Code để hỗ trợ Production

### 1. Cập nhật SecurityConfig.java để đọc CORS từ environment variable

File đã có `config.addAllowedOriginPattern("*")` nên sẽ hoạt động với mọi origin. Nhưng để bảo mật hơn, bạn có thể cập nhật:

```java
@Value("${cors.allowed-origins:http://localhost:3000}")
private String allowedOrigins;

// Trong corsConfigurationSource():
if (allowedOrigins.contains(",")) {
    config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
} else {
    config.addAllowedOriginPattern(allowedOrigins);
}
```

### 2. Tạo file `application-production.properties` (optional)

```properties
# Production settings
spring.jpa.hibernate.ddl-auto=validate
spring.sql.init.mode=never
spring.jpa.show-sql=false
logging.level.root=INFO
```

---

## ✅ Kiểm tra sau khi Deploy

### 1. Test Backend Health Check

```bash
curl https://your-backend-url.up.railway.app/api/health
# Kết quả mong đợi: {"status":"UP","service":"edu-webapp"}
```

### 2. Test Frontend

1. Mở trình duyệt: `https://your-frontend-url.vercel.app`
2. Thử đăng nhập với:
   - **Admin**: `admin@edu.com` / `admin123`
   - **Teacher**: `teacher@edu.com` / `teacher123`
   - **Student**: `student@edu.com` / `student123`

### 3. Kiểm tra Console

Mở **Developer Tools** (F12) → **Console** và kiểm tra:
- Không có lỗi CORS
- API calls thành công
- Không có lỗi 404 hoặc 500

---

## 🐛 Troubleshooting

### Backend không start

1. **Lỗi `./mvnw: not found` hoặc `mvn: not found`**:
   - **Nguyên nhân**: 
     - File Maven Wrapper (`mvnw`) chưa được commit vào Git
     - Hoặc Railway không tìm thấy Maven
   - **Giải pháp**: 
     - Đảm bảo các file `mvnw`, `mvnw.cmd`, và `.mvn/wrapper/maven-wrapper.properties` đã được commit vào Git
     - File `railway.json` đã được cấu hình để dùng `./mvnw clean package -DskipTests`
     - Nếu vẫn lỗi, kiểm tra xem các file Maven Wrapper có trong repository không: `git ls-files backend/mvnw`

2. **Kiểm tra logs trên Railway/Render**:
   - Xem có lỗi database connection không
   - Xem có lỗi port không (Railway/Render tự động set PORT)

3. **Kiểm tra Environment Variables**:
   - Đảm bảo tất cả biến đã được set đúng
   - Kiểm tra JWT_SECRET không rỗng

4. **Kiểm tra Build Command**:
   - Đảm bảo Maven build thành công
   - Kiểm tra JAR file được tạo ra
   - Nếu dùng Railway, file `railway.json` sẽ tự động được đọc

### Frontend không kết nối được Backend

1. **Kiểm tra REACT_APP_API_URL**:
   - Đảm bảo URL đúng và có `/api` ở cuối
   - URL phải là HTTPS (không phải HTTP)

2. **Kiểm tra CORS**:
   - Đảm bảo frontend URL đã được thêm vào `CORS_ALLOWED_ORIGINS`
   - Redeploy backend sau khi thay đổi CORS

3. **Kiểm tra Network tab**:
   - Xem request có được gửi đi không
   - Xem response status code là gì

### Database connection errors

1. **Kiểm tra Neon Database**:
   - Đảm bảo database đang hoạt động
   - Kiểm tra connection string đúng

2. **Kiểm tra SSL**:
   - Đảm bảo `sslmode=require` trong connection string

---

## 📝 Checklist Deploy

- [ ] GitHub repository đã được tạo và push code
- [ ] Railway/Render account đã được tạo
- [ ] Backend đã được deploy và có URL
- [ ] Environment variables trên backend đã được set đúng
- [ ] Backend health check trả về `{"status":"UP"}`
- [ ] Vercel account đã được tạo
- [ ] Frontend đã được deploy và có URL
- [ ] `REACT_APP_API_URL` trên Vercel đã được set đúng
- [ ] CORS trên backend đã được cập nhật với frontend URL
- [ ] Đăng nhập thành công trên production
- [ ] Các tính năng chính hoạt động bình thường

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước, bạn sẽ có:
- **Frontend URL**: `https://your-app.vercel.app`
- **Backend URL**: `https://your-app.up.railway.app` (hoặc `.onrender.com`)

Chia sẻ **Frontend URL** với bạn bè để họ có thể dùng thử! 🚀

---

## 💡 Tips

1. **Auto Deploy**: Cả Vercel và Railway/Render đều tự động deploy khi bạn push code lên GitHub
2. **Custom Domain**: Bạn có thể thêm custom domain trên Vercel (miễn phí)
3. **Monitoring**: Railway và Render đều có dashboard để xem logs và metrics
4. **Free Tier Limits**:
   - **Railway**: $5 free credit/tháng, có thể hết nhanh
   - **Render**: Free tier nhưng có thể sleep sau 15 phút không dùng
   - **Vercel**: Free tier rất hào phóng, không có giới hạn nghiêm trọng

---

**Chúc bạn deploy thành công! 🎊**

