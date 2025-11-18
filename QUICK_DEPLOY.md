# ⚡ Quick Deploy Guide - 5 Phút

Hướng dẫn deploy nhanh để chia sẻ link với bạn bè!

---

## 🎯 Bước 1: Push code lên GitHub (2 phút)

```bash
cd /Users/nguyenhoangkhanh/MY\ CODE/Web\ Dev/edu-webapp

# Kiểm tra git status
git status

# Nếu chưa có git repo
git init
git add .
git commit -m "Ready for deployment"

# Push lên GitHub (tạo repo trên GitHub trước)
git remote add origin https://github.com/YOUR_USERNAME/edu-webapp.git
git branch -M main
git push -u origin main
```

---

## 🚂 Bước 2: Deploy Backend lên Railway (2 phút)

1. **Truy cập**: https://railway.app
2. **Đăng nhập** bằng GitHub
3. **New Project** → **Deploy from GitHub repo** → Chọn `edu-webapp`
4. **Settings** → **Root Directory**: `backend`
5. **Variables** → Thêm các biến sau:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-orange-flower-a1d57mto-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=npg_iFk1qnmd9PHv
JWT_SECRET=day-la-mot-chuoi-bi-mat-rat-dai-va-an-toan-cho-hs512-ban-co-the-them-so-12345-va-ky-tu-dac-biet
GEMINI_API_KEY=AIzaSyCgL2z1tKWjet65nyov1tSVXl2f6oCLIJA
```

6. **Đợi deploy xong** → Copy URL backend (ví dụ: `https://xxx.up.railway.app`)

---

## 🌐 Bước 3: Deploy Frontend lên Vercel (1 phút)

1. **Truy cập**: https://vercel.com
2. **Đăng nhập** bằng GitHub
3. **Add New Project** → Import `edu-webapp`
4. **Root Directory**: `frontend`
5. **Environment Variables** → Thêm:

```env
REACT_APP_API_URL=https://YOUR_BACKEND_URL.up.railway.app/api
```

*(Thay `YOUR_BACKEND_URL` bằng URL từ Railway)*

6. **Deploy** → Đợi xong → Copy URL frontend

---

## ✅ Xong! 

Chia sẻ **Frontend URL** với bạn bè! 🎉

**Tài khoản demo:**
- Admin: `admin@edu.com` / `admin123`
- Teacher: `teacher@edu.com` / `teacher123`
- Student: `student@edu.com` / `student123`

---

## 🐛 Nếu có lỗi

1. **Backend không start**: Xem logs trên Railway
2. **Frontend không kết nối**: Kiểm tra `REACT_APP_API_URL` đúng chưa
3. **CORS error**: Đảm bảo backend URL có HTTPS

Xem chi tiết trong `DEPLOY_PRODUCTION.md`

