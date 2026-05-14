const mongoose = require('mongoose');
const Category = require('../models/Category');
const Major = require('../models/Major');
const slugify = require('slugify');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

const curriculum = [
  {
    title: "Kiến thức Cơ sở ngành",
    subjects: [
      "Nhập môn Công nghệ thông tin", "Cơ sở lập trình", "Cơ sở dữ liệu", 
      "Nhập môn Mạng máy tính và điện toán đám mây", "Cấu trúc dữ liệu và giải thuật", 
      "Toán rời rạc", "Kỹ thuật lập trình", "Lập trình hướng đối tượng",
      "Các nền tảng phát triển phần mềm", "Hệ điều hành và lập trình Linux",
      "Lập trình ứng dụng Web", "Nhập môn Phân tích Dữ liệu và Học sâu",
      "Hệ Quản trị Cơ sở dữ liệu", "Lập trình ứng dụng Java",
      "An ninh Mạng máy tính", "Quản lý Dự án CNTT",
      "Thiết kế giao diện người dùng", "Lập trình ứng dụng di động"
    ]
  },
  {
    title: "Công nghệ Phần mềm (SE)",
    subjects: [
      "Nhập môn Công nghệ phần mềm", "Kỹ thuật lấy yêu cầu", "Kiểm thử phần mềm", 
      "Phân tích và thiết kế hệ thống theo Hướng đối tượng", "Lập trình Web nâng cao", 
      "Quản lý dự án phần mềm", "Lập trình di động nâng cao", "Lập trình Java nâng cao",
      "Lập trình Python nâng cao", "Kiểm thử tự động", "Quản lý chất lượng phần mềm",
      "Thiết kế kiến trúc phần mềm"
    ]
  },
  {
    title: "Công nghệ Dữ liệu (DS)",
    subjects: [
      "Xác suất thống kê ứng dụng", "Nhập môn Phân tích Dữ liệu lớn", 
      "Số hóa và quản trị thông tin số", "Mã hóa và an toàn dữ liệu"
    ]
  },
  {
    title: "Trí tuệ Nhân tạo (AI)",
    subjects: [
      "Nhập môn Trí tuệ nhân tạo", "Nhập môn học máy", "Các hệ hỗ trợ ra quyết định",
      "Xác suất và Thống kê cho Khoa học máy tính", "Học máy ứng dụng",
      "Trí tuệ nhân tạo ứng dụng", "Thị giác máy tính", "Học sâu",
      "Các công cụ và nền tảng cho trí tuệ nhân tạo", "Lập trình tính toán song song",
      "Nhập môn tối ưu hóa"
    ]
  },
  {
    title: "Hệ thống nhúng & IoT",
    subjects: [
      "Lập trình Hệ thống nhúng và Internet vạn vật"
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for clean seeding...");

    // 1. XÓA TOÀN BỘ DANH MỤC CŨ ĐỂ DỌN DẸP DƯ THỪA
    console.log("Cleaning old categories...");
    await Category.deleteMany({});
    
    // 2. SEED LẠI THEO CẤU TRÚC MỚI GỌN GÀNG
    for (const group of curriculum) {
      const parentSlug = slugify(group.title, { lower: true });
      const parent = new Category({
        name: group.title,
        slug: parentSlug,
        description: `Chuyên ngành ${group.title}`
      });
      await parent.save();

      for (const subject of group.subjects) {
        const subjectSlug = slugify(subject, { lower: true });
        const newSubject = new Category({
          name: subject,
          slug: subjectSlug,
          parentId: parent._id,
          description: `Môn học ${subject}`
        });
        await newSubject.save();
      }
    }

    console.log("Seeding complete! Now you have only 5 main groups.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();