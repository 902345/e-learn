import nodemailer from "nodemailer";

export const Sendmail = async function(email, subject, message) {
    // Use consistent configuration - port 587 with TLS
    const transporter = nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // false for port 587, true for port 465
        requireTLS: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: subject,
        html: message
    };

    console.log(`Sending email to: ${email}, Subject: ${subject}`);
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Error sending email: ' + error.message };
    }
};

// Alternative configuration using Gmail service (more reliable)
export const SendmailSecure = async function(email, subject, message) {
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS, // Make sure this is an App Password
        },
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: subject,
        html: message
    };

    console.log(`Sending email to: ${email}, Subject: ${subject}`);
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Error sending email: ' + error.message };
    }
};