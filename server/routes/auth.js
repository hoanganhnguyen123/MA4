const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ---------------------- Đăng ký ----------------------
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// ---------------------- Đăng nhập ----------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// ---------------------- Quên mật khẩu (giả lập) ----------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const resetLink = `http://localhost:5500/reset-password.html?token=${resetToken}`;

    console.log(`[Reset Link for ${email}]: ${resetLink}`);

    res.json({
      message: `Đã gửi liên kết khôi phục đến ${email} (giả lập, xem console)`
    });
  } catch (err) {
    console.error('[Forgot Password Error]', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// ---------------------- Đặt lại mật khẩu ----------------------
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error('[Reset Password Error]', err);
    res.status(400).json({ message: 'Liên kết không hợp lệ hoặc đã hết hạn.' });
  }
});

// ---------------------- Lấy thông tin người dùng từ token ----------------------
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ id: decoded.id, email: decoded.email });
  } catch (err) {
    res.status(400).json({ message: 'Token không hợp lệ' });
  }
});

module.exports = router;
