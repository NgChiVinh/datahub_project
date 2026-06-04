const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const SEED_FOLDER = path.join(__dirname, "../seed_materials");

// Danh sách các tài liệu từ các nguồn SIÊU ỔN ĐỊNH (Google, MIT, CMU...)
const SAMPLE_FILES = [
  {
    name: "huong-dan-seo-google.pdf",
    url: "https://www.google.com/webmasters/docs/search-engine-optimization-starter-guide.pdf"
  },
  {
    name: "lap-trinh-java-cambridge.pdf",
    url: "https://www.cl.cam.ac.uk/teaching/current/ProgJava/next-java-slides.pdf"
  },
  {
    name: "cau-truc-du-lieu-cmu.pdf",
    url: "https://www.cs.cmu.edu/~adamchik/15-121/lectures/Recursion/Recursion.pdf"
  },
  {
    name: "huong-dan-mongodb.pdf",
    url: "https://www.tutorialspoint.com/mongodb/mongodb_tutorial.pdf"
  }
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith("https") ? https : http;
    
    const options = {
        rejectUnauthorized: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 20000 // 20 giây timeout
    };
    
    client.get(url, options, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let newUrl = response.headers.location;
        if (!newUrl.startsWith("http")) {
            const parsedUrl = new URL(url);
            newUrl = `${parsedUrl.protocol}//${parsedUrl.host}${newUrl}`;
        }
        downloadFile(newUrl, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Lỗi server: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => reject(err));
    }).on("timeout", () => {
        reject(new Error("Hết thời gian chờ (Timeout)"));
    });
  });
};

const run = async () => {
  if (!fs.existsSync(SEED_FOLDER)) {
    fs.mkdirSync(SEED_FOLDER);
  }

  console.log("📥 Đang tải tài liệu mẫu từ Google, Cambridge và CMU...");

  let successCount = 0;
  for (const item of SAMPLE_FILES) {
    const dest = path.join(SEED_FOLDER, item.name);
    try {
      console.log(`- Đang tải: ${item.name}...`);
      await downloadFile(item.url, dest);
      console.log(`  ✅ Thành công!`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Lỗi: ${err.message}`);
    }
  }

  if (successCount > 0) {
    console.log(`\n✨ Tuyệt vời! Đã tải xong ${successCount} file chất lượng.`);
    console.log("Giờ hãy chạy lệnh này để AI bắt đầu xử lý:");
    console.log("node scripts/auto_seed.js");
  } else {
    console.log("\n❌ Vẫn lỗi à? Chắc mạng chỗ em đang chặn gắt rồi.");
    console.log(">>> GIẢI PHÁP CUỐI: Em hãy lấy đại 2-3 file PDF có sẵn trong máy (CV, Slide, hay ebook nào đó), copy vào folder 'data_hub/Backend/seed_materials' rồi chạy 'node scripts/auto_seed.js' là xong luôn!");
  }
};

run();
