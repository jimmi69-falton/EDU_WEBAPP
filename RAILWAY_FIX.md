# 🔧 Hướng dẫn sửa lỗi Railway Deployment

## Vấn đề
Railway vẫn đang dùng build command cũ `mvn clean package -DskipTests` thay vì `./mvnw`.

## Giải pháp

### Option 1: Dùng Dockerfile (Khuyến nghị - Đã cấu hình sẵn)

File `railway.json` đã được cập nhật để dùng Dockerfile. Railway sẽ tự động detect và build từ Dockerfile.

**Bước 1**: Commit và push code:
```bash
git add backend/railway.json backend/Dockerfile
git commit -m "Configure Railway to use Dockerfile"
git push
```

**Bước 2**: Trên Railway Dashboard:
1. Vào **Settings** của service
2. Đảm bảo **Root Directory** là `backend`
3. **Builder** sẽ tự động là `Dockerfile` (nếu Railway đọc được `railway.json`)
4. Nếu không, chọn **Builder** → **Dockerfile**
5. **Dockerfile Path**: `backend/Dockerfile` (hoặc `Dockerfile` nếu Root Directory đã là `backend`)

### Option 2: Cập nhật Settings thủ công

Nếu Railway không đọc `railway.json`, cập nhật Settings:

1. Vào Railway Dashboard → Service → **Settings**
2. **Root Directory**: `backend`
3. **Build Command**: `./mvnw clean package -DskipTests`
4. **Start Command**: `java -jar target/hr-backend-0.0.1-SNAPSHOT.jar`

**Lưu ý**: Đảm bảo các file sau đã được commit vào Git:
- `backend/mvnw`
- `backend/mvnw.cmd`
- `backend/.mvn/wrapper/maven-wrapper.properties`

### Option 3: Xóa và tạo lại Service

Nếu vẫn không được:

1. Xóa service hiện tại trên Railway
2. Tạo service mới từ GitHub repo
3. Chọn **Root Directory**: `backend`
4. Railway sẽ tự động detect Dockerfile hoặc đọc `railway.json`

---

## Kiểm tra

Sau khi deploy, kiểm tra logs trên Railway để đảm bảo:
- Build thành công với `./mvnw`
- JAR file được tạo tại `target/hr-backend-0.0.1-SNAPSHOT.jar`
- Application start thành công

Test health check:
```bash
curl https://your-backend-url.up.railway.app/api/health
```

