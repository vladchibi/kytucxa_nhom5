// server.js - Backend đơn giản cho đăng ký
const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const PORT = 3000;
const USERS_FILE = path.join(__dirname, "users.json");

// Đọc user từ file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    if (err.code === "ENOENT") return []; // chưa có file
    throw err;
  }
}

// Ghi user vào file
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// Parse body JSON
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

// API đăng ký
async function handleRegister(req, res) {
  try {
    const { name, email, phone, password } = await parseBody(req);

    if (!name || !email || !phone || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Thiếu thông tin" }));
    }

    const users = await readUsers();
    if (users.find(u => u.email === email)) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email đã tồn tại" }));
    }

    users.push({ name, email, phone, password, createdAt: new Date() });
    await writeUsers(users);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, message: "Đăng ký thành công!" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Server
const server = http.createServer((req, res) => {
  // Cho phép CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/api/register" && req.method === "POST") {
    return handleRegister(req, res);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
