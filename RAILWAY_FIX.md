# 🔧 Hướng dẫn sửa lỗi Railway Deployment

## Vấn đề
Railway báo lỗi `Dockerfile does not exist` hoặc không tìm thấy Dockerfile.

## Giải pháp

### ⚠️ QUAN TRỌNG: Cấu hình Root Directory trên Railway

**Bước 1**: Trên Railway Dashboard:
1. Vào **Settings** của service backend
2. **QUAN TRỌNG**: Set **Root Directory** là `backend` (không để trống!)
3. **Builder**: Chọn `Dockerfile`
4. **Dockerfile Path**: `Dockerfile` (vì Root Directory đã là `backend`)

**Bước 2**: Commit và push code:
```bash
git add backend/railway.json backend/Dockerfile
git commit -m "Configure Railway to use Dockerfile"
git push
```

### Option 2: Nếu Railway build từ root (không set Root Directory)

Nếu Railway build từ root của repo, bạn có 2 lựa chọn:

**A. Dùng Dockerfile ở root** (đã tạo sẵn `Dockerfile.backend`):
1. Đổi tên `Dockerfile.backend` thành `Dockerfile` ở root
2. Hoặc set **Dockerfile Path** là `Dockerfile.backend`

**B. Hoặc set Root Directory trên Railway** (Khuyến nghị):
1. Vào Settings → **Root Directory**: `backend`
2. **Dockerfile Path**: `Dockerfile`

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

