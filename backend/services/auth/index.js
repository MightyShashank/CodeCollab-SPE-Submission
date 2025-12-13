import express from 'express'; // type module, require() would be commonjs
import dotenv from 'dotenv';
import pool from './db/connectDB.js'; // whenever importing local file in BE folder do this .js (since type="module")
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser'; // cookie parser lets you extract cookie from your browser (useful when extracting our jwt token)
import cors from 'cors'; // <-- Import the cors package

dotenv.config(); // this is imp else your file cant read the .env variables 
const app = express();
const PORT = process.env.PORT || 5000;

// --- NEW: Trust the GKE Ingress Proxy ---
// This tells Express to trust the X-Forwarded-For header set by the load balancer.
// '1' means it will trust the first hop from the proxy.
app.set('trust proxy', 1);

app.use(cors({
    origin: ['https://localhost:5175', 'https://codecollab.co.in'], // In production, change this to your frontend's domain
    credentials: true
}));

// --- FIXED: Add the express.json() middleware ---
app.use(express.json()); // this allows one to parse incoming requests: req.body
app.use(cookieParser()); // to extract our jwt token, this allows us to parse incoming cookies


app.use('/', authRoutes);


// --- Health Check Endpoint ---
// This is used by Kubernetes to verify that the server is running.
app.get('/healthy', (req, res) => {
    res.status(200).send('healthy');
});


// Global error handler for invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Other errors
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
    // The pool manages connections automatically. 
    // The 'connect' event listener in connectDB.js will log the connection status.
    console.log(`Auth server is running on port ${PORT}`);
});
