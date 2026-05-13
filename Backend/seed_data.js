const mongoose = require('mongoose');
const Category = require('./models/Category');
const Major = require('./models/Major');
const slugify = require('slugify');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

const curriculum = [
  {
    title: "Kiến thức cơ sở ngành",
    subjects: [
      "Nhập môn Công nghệ thông tin", "Cơ sở lập trình", "Cơ sở dữ liệu", 
      "Nhập môn Mạng máy tính và điện toán đám mây", "Cấu trúc dữ liệu và giải thuật", 
      "Toán rời rạc", "Kỹ thuật lập trình", "Lập trình hướng đối tượng", 
      "Các nền tảng phát triển phần mềm", "Hệ điều hành và lập trình Linux", 
      "Lập trình ứng dụng Web", "Nhập môn Phân tích Dữ liệu và Học sâu", 
      "Hệ Quản trị Cơ sở dữ liệu", "Lập trình ứng dụng Java", 
      "An ninh Mạng máy tính", "Quản lý Dự án CNTT", 
      "Thiết kế giao diện người dùng", "Lập trình ứng dụng di động",
      "Lập trình Hệ thống nhúng và Internet vạn vật"
    ]
  },
  {
    title: "Công nghệ Phần mềm",
    subjects: [
      "Nhập môn Công nghệ phần mềm", "Kỹ thuật lấy yêu cầu", "Kiểm thử phần mềm", 
      "Phân tích và thiết kế hệ thống theo Hướng đối tượng", "Lập trình Web nâng cao", 
      "Quản lý dự án phần mềm", "Lập trình di động nâng cao", 
      "Lập trình Java nâng cao", "Lập trình Python nâng cao", 
      "Kiểm thử tự động", "Quản lý chất lượng phần mềm", 
      "Thiết kế kiến trúc phần mềm"
    ]
  },
  {
    title: "Công nghệ Dữ liệu",
    subjects: [
      "Xác suất thống kê ứng dụng", "Nhập môn Trí tuệ nhân tạo", 
      "Nhập môn Phân tích Dữ liệu lớn", "Nhập môn học máy", 
      "Các hệ hỗ trợ ra quyết định", "Số hóa và quản trị thông tin số",
      "Mã hóa và an toàn dữ liệu"
    ]
  },
  {
    title: "Trí tuệ Nhân tạo",
    subjects: [
      "Xác suất và Thống kê cho Khoa học máy tính", "Học máy ứng dụng", 
      "Trí tuệ nhân tạo ứng dụng", "Thị giác máy tính", "Học sâu", 
      "Các công cụ và nền tảng cho trí tuệ nhân tạo",
      "Lập trình tính toán song song", "Nhập môn tối ưu hóa"
    ]
  }
];

const majors = [
  { majorCode: "CNTT", name: "Công nghệ thông tin", department: "Kỹ thuật Công nghệ" },
  { majorCode: "ATTT", name: "An toàn thông tin", department: "Kỹ thuật Công nghệ" },
  { majorCode: "KTPM", name: "Kỹ thuật phần mềm", department: "Kỹ thuật Công nghệ" },
  { majorCode: "KHMT", name: "Khoa học máy tính", department: "Kỹ thuật Công nghệ" }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data (Optional, but good for a fresh start in development)
    // await Category.deleteMany({});
    // await Major.deleteMany({});

    // Seed Majors
    for (const m of majors) {
      await Major.findOneAndUpdate(
        { majorCode: m.majorCode },
        m,
        { upsert: true, new: true }
      );
    }
    console.log("Majors seeded.");

    // Seed Categories
    for (const group of curriculum) {
      const parentSlug = slugify(group.title, { lower: true });
      let parent = await Category.findOne({ slug: parentSlug });
      
      if (!parent) {
        parent = new Category({
          name: group.title,
          slug: parentSlug,
          description: `Danh mục ${group.title}`
        });
        await parent.save();
      }

      for (const subject of group.subjects) {
        const subjectSlug = slugify(subject, { lower: true });
        const existingSubject = await Category.findOne({ slug: subjectSlug });
        
        if (!existingSubject) {
          const newSubject = new Category({
            name: subject,
            slug: subjectSlug,
            parentId: parent._id,
            description: `Môn học ${subject}`
          });
          await newSubject.save();
        }
      }
    }
    console.log("Categories seeded.");

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();