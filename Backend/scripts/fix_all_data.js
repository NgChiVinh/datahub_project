const mongoose = require('mongoose');
const Category = require('../models/Category');
const Major = require('../models/Major');
const Material = require('../models/Material');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datahub';

const curriculum = [
  {
    title: "Kiến thức Cơ sở ngành",
    majorCode: "IT",
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
    majorCode: "SE",
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
    majorCode: "DS",
    subjects: [
      "Xác suất thống kê ứng dụng", "Nhập môn Phân tích Dữ liệu lớn", 
      "Số hóa và quản trị thông tin số", "Mã hóa và an toàn dữ liệu"
    ]
  },
  {
    title: "Trí tuệ Nhân tạo (AI)",
    majorCode: "AI",
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
    majorCode: "NW",
    subjects: [
      "Lập trình Hệ thống nhúng và Internet vạn vật"
    ]
  }
];

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Lấy tất cả Majors
    const majors = await Major.find();
    const majorMap = {};
    majors.forEach(m => {
      majorMap[m.majorCode] = m._id;
    });

    console.log("Mapping categories to majors and setting parents...");

    for (const group of curriculum) {
      const majorId = majorMap[group.majorCode];
      if (!majorId) {
        console.warn(`Warning: Major ${group.majorCode} not found!`);
        continue;
      }

      // Tìm category cha
      let parent = await Category.findOne({ name: group.title });
      if (parent) {
        parent.majorId = majorId;
        parent.parentId = null;
        await parent.save();
        console.log(`Updated parent: ${parent.name} -> Major: ${group.majorCode}`);

        // Cập nhật các môn học con
        for (const subjectName of group.subjects) {
          let subject = await Category.findOne({ name: subjectName });
          if (subject) {
            subject.parentId = parent._id;
            subject.majorId = majorId;
            await subject.save();
          }
        }
      }
    }

    // 2. Thử phân loại lại tài liệu dựa trên tiêu đề (optional)
    console.log("\nClassifying materials based on titles...");
    const materials = await Material.find();
    const allCategories = await Category.find();
    
    let moveCount = 0;
    for (const m of materials) {
      // Nếu tài liệu đang ở "Kiến thức Cơ sở ngành" thì mới thử tìm chỗ đúng hơn
      // Hoặc nếu nó đang bị mồ côi
      const coreParent = await Category.findOne({ name: "Kiến thức Cơ sở ngành" });
      
      if (m.categoryId.toString() === coreParent._id.toString()) {
        for (const cat of allCategories) {
          if (cat._id.toString() === coreParent._id.toString()) continue;
          
          // Kiểm tra xem tên môn học có trong tiêu đề không
          if (m.title.toLowerCase().includes(cat.name.toLowerCase())) {
            m.categoryId = cat._id;
            await m.save();
            moveCount++;
            console.log(`Moved "${m.title}" to category "${cat.name}"`);
            break;
          }
        }
      }
    }
    console.log(`\nRe-classified ${moveCount} materials.`);

    console.log("\nFix complete!");
    process.exit(0);
  } catch (err) {
    console.error("Fix error:", err);
    process.exit(1);
  }
}

fix();