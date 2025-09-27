const http = require("http");
const sql = require("mssql");
const querystring = require("querystring");

// Cấu hình kết nối SQL Server
const dbConfig = {
  user: "sa",                 // thay bằng user SQL Server của bạn
  password: "your_password",  // thay bằng password
  server: "localhost",        // tên server (VD: localhost)
  database: "DormDB",         // tên database
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Tạo server
const server = http.createServer(async (req, res) => {
  // Cho phép CORS để frontend HTML gọi API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API test
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Backend DormSpace bằng Node.js thuần 🚀");
    return;
  }

  // API đặt phòng
  if (req.url === "/api/bookings" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        // Nếu frontend gửi JSON
        let data;
        try {
          data = JSON.parse(body);
        } catch {
          // Nếu form gửi dạng x-www-form-urlencoded
          data = querystring.parse(body);
        }

        const {
          fullName,
          phone,
          email,
          identityCard,
          address,
          checkIn,
          stayDuration,
          note
        } = data;

        // Kết nối database
        let pool = await sql.connect(dbConfig);

        await pool.request()
          .input("FullName", sql.NVarChar, fullName)
          .input("Phone", sql.NVarChar, phone)
          .input("Email", sql.NVarChar, email)
          .input("IdentityCard", sql.NVarChar, identityCard)
          .input("Address", sql.NVarChar, address)
          .input("CheckIn", sql.Date, checkIn)
          .input("StayDuration", sql.NVarChar, stayDuration)
          .input("Note", sql.NVarChar, note)
          .query(`
            INSERT INTO Bookings (FullName, Phone, Email, IdentityCard, Address, CheckIn, StayDuration, Note)
            VALUES (@FullName, @Phone, @Email, @IdentityCard, @Address, @CheckIn, @StayDuration, @Note)
          `);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Đặt phòng thành công ✅" }));

      } catch (err) {
        console.error("Lỗi:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Lỗi server", error: err.message }));
      }
    });
    return;
  }

  // Nếu không khớp route
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Chạy server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
