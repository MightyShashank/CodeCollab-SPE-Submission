import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL } from "./emailsTemplates.js";
import mailTransporter from "./zohoEmail.config.js";



export const sendVerficationEmail = async (email, verificationToken) => {

    const recipient = [{email}]; // we passed a list of objects

    try {
        // send email using these transporters you just imported
        const mailOptions = {
            from: '"CodeCollab" <shashank@codecollab.co.in>',
            to: recipient.map(obj => obj.email).join(','), // Join emails as comma-separated list
            subject: 'CodeCollab Verification Email',
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken).replaceAll("{email}", email),
            category: "Email Verfication" // just putting a category to email
        };

        const response = await mailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Email sending failed:', err);
            } else {
                console.log('Email sent successfully:', info.response);
            }
        });

        console.log("Email sent successfully", response);

    } catch (error) {
        console.error("Error sending verification", error);
        throw new Error(`Error sending verification email: ${email}`);
    }
};

/*
    // transporter ends here
    const mailOptions = {
        from: '"CodeCollab" <shashank@codecollab.co.in>',
        to: 'shashankvactech@gmail.com',
        subject: 'Test Email',
        text: 'This is a test email from your app using Zoho SMTP!',
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Email sending failed:', err);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
*/

export const sendWelcomeEmail = async (email, name) => {

    const recipient = [{email}]; // we passed a list of objects

    try {
        
        const mailOptions = {
            from: '"CodeCollab" <shashank@codecollab.co.in>',
            to: recipient.map(obj => obj.email).join(','), // Join emails as comma-separated list
            subject: 'CodeCollab Welcome Email',
            html: WELCOME_EMAIL.replaceAll("{email}", email).replaceAll("{username}", name),
            category: "Welcome Email" // just putting a category to email
        };

        const response = await mailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Welcome email sending failed:', err);
            } else {
                console.log('Welcome email sent successfully:', info.response);
            }
        });

        console.log("Welcome email sent successfully", response);

    } catch (error) {
        console.error("Error sending welcome email", error);
        throw new Error(`Error sending welcome email: ${email}`);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {

    const recipient = [{email}]; // we passed a list of objects
    
    try {
        
        const mailOptions = {
            from: '"CodeCollab" <shashank@codecollab.co.in>',
            to: recipient.map(obj => obj.email).join(','), // Join emails as comma-separated list
            subject: 'CodeCollab Password Reset Email',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replaceAll("{resetURL}", resetURL).replaceAll("{email}", email),
            category: "Password Reset Email" // just putting a category to email
        };
        

        const response = await mailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Password reset email sending failed:', err);
            } else {
                console.log('Password reset email sent successfully:', info.response);
            }
        });

        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        return res.status(400).json({success: false, message: error.message});
    }
};

export const sendResetSuccessEmail = async (email) => {
    
    const recipient = [{email}];

    try {
        
        const mailOptions = {
            from: '"CodeCollab" <shashank@codecollab.co.in>',
            to: recipient.map(obj => obj.email).join(','), // Join emails as comma-separated list
            subject: 'CodeCollab Password Successfully Reset',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE.replaceAll("{email}", email),
            category: "Password Reset Success Email" // just putting a category to email
        };
        

        const response = await mailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Password reset success email sending failed:', err);
            } else {
                console.log('Password reset success email sent successfully:', info.response);
            }
        });

        console.log("Password reset success email sent successfully", response);
    } catch (error) {
        console.log("Error in sending password reset success email ", error);
        return res.status(400).json({success: false, message: error.message});
    }
};