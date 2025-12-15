// filename: gateway-server.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

app.use(cookieParser());

app.use(cors
({
  origin: ['http://localhost:5175', 'https://localhost:5175', 'https://codecollab.co.in'],
  credentials: true,
}));

/* ============================================================
   VERIFY TOKEN (HEADER FIRST, COOKIE FALLBACK)
============================================================ */
export const verifyAndSetHeaders = (req, res, next) => {
  let token = null;

  // 1️⃣ Prefer Authorization header (localStorage flow)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2️⃣ Fallback to cookie (legacy / prod flow)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    // Inject headers for downstream services
    req.headers['X-User-Id'] = req.userId;
    req.headers['X-Auth-Token'] = token;

    console.log(`[VERIFY] userId=${req.userId} (auth OK)`);

    next();
  } catch (err) {
    console.error('[VERIFY FAILED]', err.message);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/* ============================================================
   SERVICE URLS
============================================================ */
const AUTH_SERVICE_URL = 'http://auth-server-internal';
const WEBHOOK_SERVICE_URL = 'http://webhook-server-internal';
const BOILERPLATE_SERVICE_URL = 'http://boilerplate-server-internal';
const PARSER_SERVICE_URL = 'http://url-parser-internal';
const PROBLEM_AI_SERVICE_URL = 'http://problem-ai-service-internal';

/* ============================================================
   PROXY OPTIONS
============================================================ */
const options = {
  changeOrigin: true,
  proxyTimeout: 300000,
  onProxyReq: (proxyReq, req) => {
    if (req.userId) {
      proxyReq.setHeader('X-User-Id', req.userId);
    }
    if (req.headers['X-Auth-Token']) {
      proxyReq.setHeader('X-Auth-Token', req.headers['X-Auth-Token']);
    }
  },
};

/* ============================================================
   MAIN ROUTER
============================================================ */
app.use('/', (req, res, next) => {
  const path = req.path;

  /* ---------- PUBLIC ROUTES ---------- */

  if (path === '/healthy') {
    return res.status(200).send('healthy');
  }

  if (path.startsWith('/api/auth')) {
    return createProxyMiddleware({
      ...options,
      target: AUTH_SERVICE_URL,
      pathRewrite: { '^/api/auth': '/' },
    })(req, res, next);
  }

  if (path.startsWith('/webhook')) {
    return createProxyMiddleware({
      ...options,
      target: WEBHOOK_SERVICE_URL,
    })(req, res, next);
  }

  /* ---------- PROTECTED ROUTES ---------- */

  verifyAndSetHeaders(req, res, () => {
    let target;

    if (
      path.startsWith('/problems') ||
      path.startsWith('/submit') ||
      path.startsWith('/submissions') ||
      path.startsWith('/display_problem') ||
      path.startsWith('/parse-from-url')
    ) {
      target = WEBHOOK_SERVICE_URL;
    }
    else if (path.startsWith('/generate-boilerplate')) {
      target = BOILERPLATE_SERVICE_URL;
    }
    else if (path.startsWith('/parse-problem-url')) {
      target = PARSER_SERVICE_URL;
    }
    else if (
      path.startsWith('/hint') ||
      path.startsWith('/explain') ||
      path.startsWith('/debug')
    ) {
      target = PROBLEM_AI_SERVICE_URL;
    }
    else {
      return res.status(404).send(`Cannot ${req.method} ${path}`);
    }

    return createProxyMiddleware({ ...options, target })(req, res, next);
  });
});

/* ============================================================
   WEBSOCKETS
============================================================ */
const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
  const wsProxy = createProxyMiddleware({
    ...options,
    target: WEBHOOK_SERVICE_URL,
    ws: true,
  });
  wsProxy.upgrade(req, socket, head);
});

/* ============================================================
   START SERVER
============================================================ */
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
