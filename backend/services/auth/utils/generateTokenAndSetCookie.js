import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {

    // lets create a JWT
    // we create a JWT secretKey in our .env file

    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "7d"}); // token is invalid after 7 days, {userId} is our payload

    /*
        res.cookie(name, value, [options]);
        name: Name of the cookie (string). (you can name anything)
        value: Value you want to store (usually a string or JSON)
        options: Optional settings like expiry, httpOnly, secure, etc.


        res.cookie('token', 'abc123', {
            httpOnly: true,
            secure: true,
            maxAge: 3600000, // 1 hour in ms
        });
        
        This sets a cookie named token with value abc123:
            httpOnly: true: Can't be accessed via client-side JavaScript (for security). prevents XSS attacks
            secure: true: Sent only over HTTPS.
            maxAge: How long it stays valid.
    */ 

    res.cookie("token", token, {
        httpOnly: true,
        // 'none' is required to allow the cookie to be sent from your frontend to your backend domain.
        secure: false, // secure is true only when we are in production
        sameSite: "lax", // this prevents CSRF attacks, if "strict" that prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 100, // milliSeconds 7 days
        path: "/", // cookie will be sent for all routes, see to remove if req
    });

    

    return token;
}