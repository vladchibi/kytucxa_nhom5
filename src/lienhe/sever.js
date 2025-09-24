const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API test
app.get("/", (req, res) => {
  res.send("DormSpace Backend đang chạy...");
});

// API nhận form liên hệ
app.post("/api/contact", (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
  }

  // Xử lý lưu DB hoặc gửi mail ở đây
  console.log("Dữ liệu liên hệ:", { name, email, phone, subject, message });

  // Trả kết quả cho frontend
  res.json({ success: true, message: "Gửi liên hệ thành công!" });
});

// Chạy server
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
