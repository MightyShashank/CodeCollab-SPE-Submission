// filename: verifyToken.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // --- FIXED: Get the token from the cookie parser ---
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret from your environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add the decoded user ID to the request object
        console.log(`currently in verify token, decoded.userId = ${decoded.userId}`);
        req.userId = decoded.userId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};


