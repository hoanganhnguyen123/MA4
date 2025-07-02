// Load biến môi trường từ .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// ✅ Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB đã kết nối'))
.catch(err => console.error('❌ Lỗi MongoDB:', err));

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Phục vụ ảnh đã duyệt
const approvedDir = path.join(__dirname, 'uploads/approved');
app.use('/uploads/approved', express.static(approvedDir));

// ✅ Tạo thư mục nếu chưa tồn tại
const pendingDir = path.join(__dirname, 'uploads/pending');
if (!fs.existsSync(pendingDir)) fs.mkdirSync(pendingDir, { recursive: true });
if (!fs.existsSync(approvedDir)) fs.mkdirSync(approvedDir, { recursive: true });

// ✅ Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pendingDir); // Lưu vào thư mục pending
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Lấy đuôi ảnh (.jpg, .png, ...)
    const base = path.basename(file.originalname, ext); // Tên không có đuôi
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, base + '-' + uniqueSuffix + ext); // Gộp lại thành tên đầy đủ
  }
});

const upload = multer({ storage }); // ← thay thế dòng cũ

// ✅ API upload ảnh
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('❌ Không có tệp nào được tải lên.');
  }
console.log(`✅ File: ${req.file.originalname} đã được lưu tại: ${req.file.path}`);
  res.send('✅ Ảnh đã được tải lên và đang chờ admin duyệt.');
});

// ✅ API trả về danh sách ảnh đã duyệt
app.get('/approved-images', (req, res) => {
  fs.readdir(approvedDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi đọc thư mục ảnh' });
    }
    const urls = files.map(file => `/uploads/approved/${file}`);
    res.json(urls);
  });
});
// ✅ Route gốc
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
// ✅ API khác nếu có
app.use('/api/auth', require('./routes/auth'));

// ✅ Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('❌ Không có tệp nào được tải lên.');
  }

  console.log('✅ Đã nhận file:', req.file.originalname);
  console.log('📂 Đã lưu tại:', req.file.path);

  res.send('✅ Ảnh đã được tải lên và đang chờ admin duyệt.');
});
