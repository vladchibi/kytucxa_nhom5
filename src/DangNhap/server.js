// server.js - Node.js thuần (no frameworks)
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const USERS_FILE = path.join(__dirname, 'users.json');

const PORT = process.env.PORT || 3000;

// sessions in-memory: token -> { email, expiresAt }
const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24h

// --- utility ---
async function readUsers() {
  try {
    const txt = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}
function hashPassword(password, salt = null) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hashed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hashed };
}
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
function sendJson(res, statusCode, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  });
  res.end(data);
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}
function getAuthToken(req) {
  const h = req.headers['authorization'] || '';
  if (!h) return null;
  const parts = h.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  return null;
}
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [k, v] of sessions.entries()) {
    if (v.expiresAt <= now) sessions.delete(k);
  }
}

// --- route handlers ---
async function handleRegister(req, res) {
  try {
    const body = await parseBody(req);
    const { email, password } = body;
    if (!email || !password) return sendJson(res, 400, { error: 'email and password required' });

    const users = await readUsers();
    if (users.find(u => u.email === email)) return sendJson(res, 409, { error: 'Email already registered' });

    const { salt, hashed } = hashPassword(password);
    const newUser = { email, salt, hashed, createdAt: new Date().toISOString() };
    users.push(newUser);
    await writeUsers(users);
    sendJson(res, 201, { ok: true, email });
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
}

async function handleLogin(req, res) {
  try {
    const body = await parseBody(req);
    const { email, password } = body;
    if (!email || !password) return sendJson(res, 400, { error: 'email and password required' });

    const users = await readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return sendJson(res, 401, { error: 'Invalid credentials' });

    const { hashed } = hashPassword(password, user.salt);
    if (hashed !== user.hashed) return sendJson(res, 401, { error: 'Invalid credentials' });

    // create session token
    const token = generateToken();
    sessions.set(token, { email, expiresAt: Date.now() + SESSION_TTL_MS });

    sendJson(res, 200, { ok: true, token });
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
}

async function handleLogout(req, res) {
  const token = getAuthToken(req);
  if (!token) return sendJson(res, 400, { error: 'Authorization Bearer token required' });
  sessions.delete(token);
  sendJson(res, 200, { ok: true });
}

async function handleProfile(req, res) {
  cleanExpiredSessions();
  const token = getAuthToken(req);
  if (!token) return sendJson(res, 401, { error: 'Missing token' });

  const s = sessions.get(token);
  if (!s) return sendJson(res, 401, { error: 'Invalid or expired token' });

  // return basic profile
  sendJson(res, 200, { ok: true, profile: { email: s.email } });
}

async function handleNotFound(res) {
  sendJson(res, 404, { error: 'Not found' });
}

// --- server ---
const server = http.createServer(async (req, res) => {
  // basic routing
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // only accept JSON for POST where needed
  try {
    if (req.method === 'OPTIONS') {
      // CORS preflight
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      });
      return res.end();
    }

    // set CORS headers for responses
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (pathname === '/api/register' && req.method === 'POST') return await handleRegister(req, res);
    if (pathname === '/api/login' && req.method === 'POST') return await handleLogin(req, res);
    if (pathname === '/api/logout' && req.method === 'POST') return await handleLogout(req, res);
    if (pathname === '/api/profile' && req.method === 'GET') return await handleProfile(req, res);

    // serve a tiny status on root
    if (pathname === '/' && req.method === 'GET') {
      return sendJson(res, 200, { message: 'Simple Auth API (Node.js thuần)' });
    }

    return handleNotFound(res);
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

