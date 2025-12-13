// filename: gateway-server.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
// import { verifyToken } from './verifyToken.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';

dotenv.config();
const app = express();

app.use(cookieParser());
import jwt from 'jsonwebtoken';

export const verifyAndSetHeaders = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        console.log(`currently in verifyAndSetHeaders, decoded.userId = ${req.userId}`);

        // --- MANUALLY DO WHAT onProxyReq WOULD HAVE DONE ---
        if (req.userId) {
            req.headers['X-User-Id'] = req.userId;
            // req.userId = req.userId;
            console.log(`[MANUAL] Set X-User-Id: ${req.userId}`);
        }
        if (req.cookies?.token) {
            req.headers['X-Auth-Token'] = req.cookies.token;
            console.log(`[MANUAL] Set X-Auth-Token`);
        }

        next(); // Continue to your inline proxy
    } catch (error) {
        console.error(`[Verify failed]`, error.message);
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};



app.use(cors({
    origin: ['https://localhost:5175', 'https://codecollab.co.in'], // Your frontend's origin
    credentials: true
}));

// --- Service URLs ---
const AUTH_SERVICE_URL = 'http://auth-server-internal';
const WEBHOOK_SERVICE_URL = 'http://webhook-server-internal';
const BOILERPLATE_SERVICE_URL = 'http://boilerplate-server-internal';
const PARSER_SERVICE_URL = 'http://url-parser-internal';
const PROBLEM_AI_SERVICE_URL = 'http://problem-ai-service-internal';


// --- Base Proxy Options ---
const options = {
    changeOrigin: true,
    proxyTimeout: 300000,
    onProxyReq: (proxyReq, req, res) => {

        console.log(`[ON_PROXY_REQ] Firing for path: ${req.path}`);
        console.log(`[ON_PROXY_REQ] Checking for req.userId... Value: ${req.userId}`);

        if (req.userId) {
            console.log(`[ON_PROXY_REQ] SUCCESS: Found userId. Setting X-User-Id header to: ${req.userId}`);
            proxyReq.setHeader('X-User-Id', req.userId);
        }
        else {
            console.log(`[ON_PROXY_REQ] WARNING: req.userId is missing. X-User-Id header will NOT be set.`);
        }

        if (req.cookies && req.cookies.token) {
            proxyReq.setHeader('X-Auth-Token', req.cookies.token);
        }
    },
};

// --- ✅ THE DEFINITIVE FIX: A SINGLE, UNIFIED ROUTER ---
// This one middleware handles all incoming requests, public and private.
app.use('/', (req, res, next) => {
    const path = req.path;

    // --- 1. Handle PUBLIC Routes First ---
    console.log(`[GATEWAY] Path "${path}" is protected. Handing off to verifyToken middleware.`);
    // Special case for auth, which needs path rewriting.
    if (path.startsWith('/api/auth')) {
        console.log('[GATEWAY] verifyToken succeeded. Now proxying protected route.');
        const proxy = createProxyMiddleware({
            ...options,
            target: AUTH_SERVICE_URL,
            pathRewrite: { '^/api/auth': '/' },
        });
        return proxy(req, res, next);
    }

    // Public webhook route. This forwards the path as-is (e.g., /webhook/test).
    if (path.startsWith('/webhook')) {
        console.log('[GATEWAY] verifyToken succeeded. Now proxying protected route.');
        const proxy = createProxyMiddleware({
            ...options,
            target: WEBHOOK_SERVICE_URL,
        });
        return proxy(req, res, next);
    }

    if (path === '/healthy') {
        return res.status(200).send('healthy');
    }

    console.log(`[GATEWAY] Path "${path}" is protected. Handing off to verifyToken middleware.`);
    verifyAndSetHeaders(req, res, () => {
        // --- 3. Handle PROTECTED Routes After Verification ---
        console.log('[GATEWAY] verifyToken succeeded. Now proxying protected route.');
        const protectedPath = req.path;
        let target;

        if (protectedPath.startsWith('/problems') || protectedPath.startsWith('/submit') || protectedPath.startsWith('/submissions') || protectedPath.startsWith('/display_problem') || protectedPath.startsWith('/parse-from-url')) {
            target = WEBHOOK_SERVICE_URL;
        } else if (protectedPath.startsWith('/generate-boilerplate')) {
            target = BOILERPLATE_SERVICE_URL;
        } else if (protectedPath.startsWith('/parse-problem-url')) {
            target = PARSER_SERVICE_URL;
        } else if (protectedPath.startsWith('/hint') || protectedPath.startsWith('/explain') || protectedPath.startsWith('/debug')) {
            target = PROBLEM_AI_SERVICE_URL;
        } else {
            // If the token is valid but the route doesn't exist, it's a 404.
            return res.status(404).send('Error: Cannot ' + req.method + ' ' + protectedPath);
        }
        
        // Proxy to the correct protected service
        const proxy = createProxyMiddleware({ ...options, target });
        return proxy(req, res, next);
    });
});


// --- Start Server ---
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

// --- WebSocket Upgrade Handler ---
server.on('upgrade', (req, socket, head) => {
    console.log('API Gateway: Proxying WebSocket upgrade request...');
    const wsProxy = createProxyMiddleware({ 
        ...options, 
        target: WEBHOOK_SERVICE_URL, 
        ws: true 
    });
    wsProxy.upgrade(req, socket, head);
});

server.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});