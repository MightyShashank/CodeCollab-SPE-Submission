// here we check whether a token is valid or not
import jwt from 'jsonwebtoken';

/*
We had earlier verfied our token as:

    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "7d"});

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.send.NODE_ENV === "production", // secure is true only when we are in production
        sameSite: "strict", // this prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 100, // milliSeconds 7 days
    });
*/

export const verifyToken = (req, res, next) => { // next() just calls the next function

    const token = req.cookies.token; // we did .token cause we had named our jwt token as "token" earlier

    if(!token) {
        return res.status(401).json({success:false, message: "Unauthorised - no token provided"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) return res.status(401).json({success:false, message:"Unauthorised - invalid token"});

        req.userId = decoded.userId; // while going across we pass our data through our req
        next();

    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(403).json({ success: false, message: "Forbidden - invalid or expired token" });
    }
}