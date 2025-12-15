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

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
