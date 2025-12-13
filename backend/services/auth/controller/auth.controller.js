// again writing as auth.controller.js is just a convention
import bcrypt from "bcryptjs";
import crypto from 'crypto';

import pool from "../db/connectDB.js"; // Import the PostgreSQL connection pool
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerficationEmail } from "../zohoEmail/emails.js";
import { sendWelcomeEmail } from "../zohoEmail/emails.js";
import { sendPasswordResetEmail, sendResetSuccessEmail } from "../zohoEmail/emails.js";

export const signup = async (req, res) => {
    // user sends some stuff
    const { email, password, name, username } = req.body; // Added username as it's required by the DB schema

    // we use a PostgreSQL transaction so that in case the email fails to send, the new user is not saved.
    const dbClient = await pool.connect();

    try {
        await dbClient.query('BEGIN'); // Start the transaction

        if (!email || !password || !name || !username) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userAlreadyExistsResult = await dbClient.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userAlreadyExistsResult.rows.length > 0) {
            return res.status(409).json({ success: false, message: "User with this email or username already exists" });
        }

        // now hashPassword 
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is our salt

        const verificationToken = generateVerificationToken(); // in utils folder
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // create a new user in the database
        const newUserQuery = `
            INSERT INTO users (email, password_hash, display_name, username, verification_token, verification_token_expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const newUserResult = await dbClient.query(newUserQuery, [email, hashedPassword, name, username, verificationToken, verificationTokenExpiresAt]);
        const user = newUserResult.rows[0];

        // now just lets create an authentication for them and send them a verification token in an email
        // jwt
        generateTokenAndSetCookie(res, user.user_id); // PostgreSQL uses user_id

        // sending verification email
        await sendVerficationEmail(user.email, verificationToken);

        await dbClient.query('COMMIT'); // All good, commit the transaction

        // Remove sensitive data before sending the response
        delete user.password_hash;

        res.status(201).json({
            success: true,
            message: "User successfully created. Please check your email to verify your account.",
            user
        });

    } catch (error) {
        await dbClient.query('ROLLBACK'); // Rollback on error
        console.error("Error in signup: ", error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        dbClient.release(); // Release the client back to the pool
    }
};

// to verify your email against the verification code 
export const verifyEmail = async (req, res) => {
    // assume there is an ui to put 6 digit code = 1 2 3 4 5 6 and its present in the body
    const { code } = req.body; // code passed by the user
    try {
        if (!code) {
            return res.status(400).json({ message: 'Verification code is required' });
        }

        const userResult = await pool.query(
            'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires_at > NOW()',
            [code]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        const user = userResult.rows[0];

        // Update user to be verified and clear tokens
        await pool.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires_at = NULL, updated_at = NOW() WHERE user_id = $1',
            [user.user_id]
        );

        await sendWelcomeEmail(user.email, user.display_name); // send welcome email to user

        return res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong during email verification' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "We couldn't find an account with that email address." });
        }

        const user = userResult.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash); // compare entered password with user password (in db)
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Incorrect password. Please try again." }); // always return a response its imp to use return else sometimes you may get errors
        }

        generateTokenAndSetCookie(res, user.user_id); // generates the jwt token and sets the cookie

        await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [user.user_id]);

        delete user.password_hash; // Remove password before sending back

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user,
        });
    } catch (error) {
        console.log("Error in login ", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // see if user with this email exists

        if (userResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        const user = userResult.rows[0];

        // generate reset token using the crypto module
        const resetPasswordToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // expires 1 hour from now

        // save to db
        await pool.query(
            'UPDATE users SET reset_password_token = $1, reset_password_token_expires_at = $2, updated_at = NOW() WHERE user_id = $3',
            [resetPasswordToken, resetPasswordTokenExpiresAt, user.user_id]
        );

        // send an email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`); // this is also supposed to take you to a reset password url link 

        // return the response
        return res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
        console.log("Error in forgotPassword ", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        // get the token
        const { token } = req.params;

        // get password and forgotPassword
        const { password, confirmPassword } = req.body;

        // we check for password and confirmPassword equality in both FE and BE
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        // find user using the resetPasswordToken
        const userResult = await pool.query(
            'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_token_expires_at > NOW()',
            [token]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }
        const user = userResult.rows[0];

        // now the token is valid so you can safely edit the password
        const hashedPassword = await bcrypt.hash(password, 10); // hash with a pinch of salt
        
        await pool.query(
            'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_token_expires_at = NULL, updated_at = NOW() WHERE user_id = $2',
            [hashedPassword, user.user_id]
        );

        // now send the reset success email
        await sendResetSuccessEmail(user.email);

        // return the response
        return res.status(200).json({ success: true, message: "Password has been reset successfully." });
    }
    catch (error) {
        console.log("Error in password reset: ", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        // req.userId is added by the authentication middleware
        const userResult = await pool.query('SELECT user_id, username, email, display_name, role, created_at, last_login, is_verified FROM users WHERE user_id = $1', [req.userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const user = userResult.rows[0];

        return res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Error in checkAuth: ", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

// In your backend auth controller
export const logout = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/', 
    };
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ success: true, message: "Logged out successfully" });
};