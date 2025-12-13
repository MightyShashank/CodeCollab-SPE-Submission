// zohoEmail.config.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables
// Replace with your actual Zoho email and app password

const mailTransporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', // or 'smtp.zoho.com' if you're outside India
  port: 587, // Use 465 for SSL, 587 for TLS
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD, // App password, not your main password
  },
});




/*
250 is a standard SMTP response code indicating that the command (in this case, sending the email) was successful.

appu@Mighty:/mnt/c/Users/shash/OneDrive/Desktop/Auth Testing$ node backend/zohoEmail/zohoEmail.config.js
[dotenv@17.2.1] injecting env (6) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
Email sent successfully: 250 Message received
*/

export default mailTransporter;
