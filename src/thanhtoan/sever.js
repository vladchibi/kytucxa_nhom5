// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Cho phép CORS để frontend gọi API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route test
  if (url.pathname === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Backend DormSpace (JS thuần) đang chạy...");
  }

  // API đặt phòng
  else if (url.pathname === "/api/book" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const response = {
          message: "Đặt phòng thành công!",
          data: data,
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Dữ liệu không hợp lệ" }));
      }
    });
  }

  // API upload ảnh (demo lưu raw binary, không parse multipart nâng cao)
  else if (url.pathname === "/api/upload" && req.method === "POST") {
    const filename = "payment_" + Date.now() + ".jpg";
    const filepath = path.join(__dirname, "uploads", filename);

    const fileStream = fs.createWriteStream(filepath);
    req.pipe(fileStream);

    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Upload ảnh thành công",
          filename: filename,
          path: "/uploads/" + filename,
        })
      );
    });
  }

  // Trả file upload tĩnh
  else if (url.pathname.startsWith("/uploads/") && req.method === "GET") {
    const filepath = path.join(__dirname, url.pathname);
    fs.readFile(filepath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Không tìm thấy file");
      } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(data);
      }
    });
  }

  // 404
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
