# Sử dụng Node.js bản stable nhẹ (Alpine)
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file quản lý thư viện trước để tối ưu Docker Cache
COPY package*.json ./

# Cài đặt các phụ thuộc (chỉ cài production để giảm dung lượng)
RUN npm install --production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 5000 (cùng với PORT mặc định của app)
EXPOSE 5000

# Lệnh khởi chạy server
CMD ["node", "server.js"]
