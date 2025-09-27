const http = require("http");
const fs = require("fs");
const path = require("path");

let bookings = []; // Lưu tạm thông tin đặt phòng

// Hàm phục vụ file tĩnh (HTML, CSS, JS)
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 - Internal Error");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url === "/" || req.url === "/XemThongTinPhong.html") {
      serveStaticFile(res, "./XemThongTinPhong.html", "text/html");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - Not Found");
    }
  }

  else if (req.method === "POST" && req.url === "/book-room") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      const booking = JSON.parse(body);
      bookings.push(booking);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Đặt phòng thành công!" }));
    });
  }

  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
