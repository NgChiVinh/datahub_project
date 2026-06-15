# Hướng Dẫn Triển Khai DataHub Lên VPS

> **Dự án:** DataHub — Nền tảng chia sẻ tài liệu học tập  
> **Domain:** https://vlu.datahub.id.vn  
> **Stack:** Ubuntu 22.04 / Nginx / Docker / PM2 / Let's Encrypt

---

## Tổng quan kiến trúc

```
User Browser
    │
    ▼
Nginx (HTTPS: vlu.datahub.id.vn)
    ├── /       → Frontend Next.js (PM2, port 3500)
    └── /api/   → Backend Express (Docker, port 5000)
                        │
                        ▼
                  MongoDB Atlas
                        │
                        ▼
              Cloudflare R2 / Cloudinary / SMTP
```

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Frontend | Next.js 16, React 19 | Giao diện người dùng |
| Backend | Node.js + Express | REST API, xử lý AI, xác thực JWT |
| Database | MongoDB Atlas + Mongoose | Lưu trữ dữ liệu |
| Reverse Proxy | Nginx | Điều hướng / và /api/ |
| SSL | Certbot / Let's Encrypt | HTTPS cho domain production |
| Runtime | Docker + PM2 | Backend chạy Docker, frontend chạy PM2 |

---

## Bước 1 — Thuê máy chủ VPS tại Atlantic.net

1. Truy cập **atlantic.net** → Đăng ký tài khoản
2. Chọn **Create Server** → Điền thông tin:
   - **Server Name:** `dieplai-dev`
   - **OS:** Ubuntu 22.04 LTS
   - **Location:** Southeast 1
   - **Gói:** phù hợp với nhu cầu (khuyến nghị tối thiểu 2 vCPU, 4GB RAM)
3. Tạo SSH Key hoặc dùng mật khẩu root
4. Nhấn **Create** → Chờ server khởi động (1–2 phút)
5. Sau khi tạo xong → server hiển thị trạng thái **Active** (màu xanh lá)
6. Nhận **IP public:** `103.47.226.171`

> Server ID: `234686` — dùng để liên hệ support nếu cần.

---

## Bước 2 — Mua tên miền và trỏ về VPS

### 2.1 Mua tên miền tại Tenten.vn

1. Truy cập **tenten.vn** → Đăng ký tài khoản
2. Tìm kiếm tên miền mong muốn (ví dụ: `datahub.id.vn`)
3. Thêm vào giỏ hàng → Thanh toán
4. Sau khi thanh toán → tên miền xuất hiện trong mục **Quản lý tên miền**

### 2.2 Cấu hình DNS trỏ về VPS

1. Đăng nhập **tenten.vn** → **Quản lý dịch vụ** → **Tên miền**
2. Chọn tên miền `datahub.id.vn` → **Quản lý DNS**
3. Thêm bản ghi DNS loại **A record**:

```
Loại:      A
Tên máy:   vlu
Địa chỉ:   103.47.226.171
TTL:       3600
```

4. Lưu lại → Chờ DNS propagate (~5–30 phút)
5. Kiểm tra:

```bash
ping vlu.datahub.id.vn
# Kết quả mong muốn: thấy IP 103.47.226.171
```

> **Lưu ý:** Subdomain `vlu.datahub.id.vn` dùng prefix `vlu` để phân biệt với các môi trường khác (dev, staging...) nếu có sau này.

---

## Bước 3 — Kết nối SSH và cài đặt môi trường

```bash
# Kết nối vào VPS
ssh root@103.47.226.171

# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Kiểm tra
node -v   # v18.x.x
npm -v    # 10.x.x

# Cài PM2 (quản lý tiến trình frontend)
npm install -g pm2

# Cài Docker
apt install -y docker.io docker-compose-plugin
systemctl enable docker
systemctl start docker

# Kiểm tra Docker
docker -v

# Cài Nginx
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Cài Certbot (SSL Let's Encrypt)
apt install -y certbot python3-certbot-nginx
```

---

## Bước 4 — Clone source code từ GitHub

```bash
cd /root
git clone https://github.com/NgChiVinh/datahub_project.git datahub_project
cd datahub_project
```

Cấu trúc thư mục sau khi clone:

```
/root/datahub_project/
├── Backend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── server.js
│   └── ...
└── frontend/
    ├── package.json
    ├── next.config.mjs
    └── ...
```

---

## Bước 5 — Cấu hình biến môi trường Backend

```bash
nano /root/datahub_project/Backend/.env
```

Điền đầy đủ các biến (thay `...` bằng giá trị thực):

```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/

# JWT
SECRET_KEY=<chuỗi_ngẫu_nhiên_dài>

# Cloudinary (lưu ảnh thumbnail)
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# OpenAI (AI features: embedding, chat, quiz)
OPENAI_API_KEY=sk-proj-...

# Cloudflare R2 (lưu file tài liệu)
R2_ACCESS_KEY_ID=<key_id>
R2_SECRET_ACCESS_KEY=<secret_key>
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET=datahubvlu
R2_PUBLIC_URL=https://files.datahub.id.vn

# URL frontend (CORS)
CLIENT_URL=https://vlu.datahub.id.vn

# Email SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<email@gmail.com>
MAIL_PASSWORD=<app_password>
MAIL_ENCRYPTION=TLS
MAIL_FROM_ADDRESS=<email@gmail.com>
MAIL_FROM_NAME=DataHub
```

> **Lưu ý bảo mật:** File `.env` được thêm vào `.gitignore`, không bao giờ commit lên GitHub.

---

## Bước 6 — Cấu hình biến môi trường Frontend

```bash
nano /root/datahub_project/frontend/.env.production
```

```env
NEXT_PUBLIC_API_URL=https://vlu.datahub.id.vn
```

---

## Bước 7 — Deploy Backend bằng Docker

```bash
cd /root/datahub_project/Backend

# Build image và khởi động container
docker compose up -d --build datahub-backend

# Kiểm tra container đang chạy
docker ps | grep datahub

# Xem log
docker logs --tail 20 datahub-backend
```

Kết quả mong muốn:

```
Server running on port 5000
Kết nối MongoDB thành công!
```

---

## Bước 8 — Build và deploy Frontend bằng PM2

```bash
cd /root/datahub_project/frontend

# Cài dependencies
npm install

# Build production
npm run build

# Khởi động với PM2 trên port 3500
# (port 3000 đã bị service khác chiếm)
PORT=3500 pm2 start npm --name datahub-frontend -- start

# Lưu danh sách process để tự khởi động lại khi reboot
pm2 save
pm2 startup

# Kiểm tra
pm2 status
```

Kết quả mong muốn: `datahub-frontend` status = **online**

---

## Bước 9 — Cấu hình Nginx reverse proxy

```bash
nano /etc/nginx/sites-available/datahub-api
```

Nội dung file cấu hình:

```nginx
server {
    server_name vlu.datahub.id.vn;

    # API Backend (Express Docker port 5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (Next.js PM2 port 3500)
    location / {
        proxy_pass http://127.0.0.1:3500;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Kích hoạt config
ln -s /etc/nginx/sites-available/datahub-api /etc/nginx/sites-enabled/

# Kiểm tra cú pháp
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Bước 10 — Cấp chứng chỉ SSL bằng Let's Encrypt

```bash
certbot --nginx -d vlu.datahub.id.vn
```

Certbot tự động:
- Cấp chứng chỉ HTTPS miễn phí (có hiệu lực 90 ngày)
- Cập nhật config Nginx thêm `listen 443 ssl`
- Redirect HTTP → HTTPS
- Tự gia hạn qua cronjob

Kiểm tra HTTPS:

```bash
curl -I https://vlu.datahub.id.vn/
# Kết quả mong muốn: HTTP/2 200
```

---

## Bước 11 — Smoke test toàn hệ thống

```bash
# Frontend
curl -I https://vlu.datahub.id.vn/

# API công khai
curl https://vlu.datahub.id.vn/api/majors
curl "https://vlu.datahub.id.vn/api/materials?limit=1"

# API bảo vệ (phải trả 401 — đúng thiết kế)
curl https://vlu.datahub.id.vn/api/users

# PM2 status
pm2 status

# Docker status
docker ps
```

---

## Quy trình redeploy khi có code mới

Mỗi lần có thay đổi code, thực hiện theo thứ tự:

```bash
# 1. Pull code mới từ GitHub
cd /root/datahub_project
git pull

# 2. Rebuild Backend Docker
cd /root/datahub_project/Backend
docker compose up -d --build datahub-backend
docker logs --tail 10 datahub-backend

# 3. Rebuild Frontend
cd /root/datahub_project/frontend
npm install
npm run build
pm2 restart datahub-frontend --update-env

# 4. Validate Nginx
nginx -t
systemctl reload nginx

# 5. Smoke test
curl -I https://vlu.datahub.id.vn/
```

---

## Lưu ý vận hành

| Tình huống | Lệnh xử lý |
|---|---|
| Xem log backend | `docker logs --tail 50 datahub-backend` |
| Xem log frontend | `pm2 logs datahub-frontend --lines 50` |
| Restart backend | `docker compose restart datahub-backend` |
| Restart frontend | `pm2 restart datahub-frontend` |
| Xem dung lượng ổ đĩa | `df -h` |
| Xem RAM đang dùng | `free -h` |

---

## Tóm tắt (dùng cho báo cáo)

Hệ thống DataHub được triển khai trên VPS Ubuntu 22.04 theo mô hình frontend và backend tách riêng. Backend Node.js/Express chạy trong Docker container ở port 5000 và kết nối MongoDB Atlas qua `MONGO_URI`. Frontend Next.js được build production và chạy bằng PM2 ở port 3500. Nginx đóng vai trò reverse proxy và SSL termination: điều hướng `/` về frontend, `/api/` về backend. Domain `vlu.datahub.id.vn` sử dụng HTTPS thông qua chứng chỉ Let's Encrypt miễn phí, tự gia hạn mỗi 90 ngày. Toàn bộ secrets và credentials được lưu trong file `.env` trên server, không commit lên GitHub.
