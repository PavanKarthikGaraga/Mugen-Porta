import nodemailer from 'nodemailer';

// Create transporter with connection pooling for better performance
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    pool: true, // Enable connection pooling
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100, // Maximum number of messages per connection
    rateLimit: 10, // Messages per second
    auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // Your email password or app password
    },
});

export const sendRegistrationEmail = async (email, name, username, password) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Successful - SAC Program</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .title {
                color: #28a745;
                font-size: 20px;
                margin: 0;
            }
            .content {
                margin-bottom: 30px;
            }
            .credentials-box {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 20px;
                margin: 20px 0;
            }
            .credentials-title {
                color: #495057;
                font-weight: bold;
                margin-bottom: 15px;
                font-size: 16px;
            }
            .credential-item {
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .credential-label {
                font-weight: bold;
                color: #6c757d;
                margin-right: 10px;
            }
            .credential-value {
                color: #007bff;
                font-family: monospace;
                background-color: #e7f3ff;
                padding: 3px 6px;
                border-radius: 3px;
            }
            .password-info {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }
            .password-title {
                color: #856404;
                font-weight: bold;
                margin-bottom: 8px;
            }
            .password-pattern {
                color: #856404;
                font-family: monospace;
                font-size: 14px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
            .important {
                color: #dc3545;
                font-weight: bold;
            }
            .success {
                color: #28a745;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SAC Program</div>
                <h1 class="title">Registration Successful! 🎉</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                
                <p class="success">Congratulations! You have successfully registered for the SAC Program.</p>
                
                <p>We are excited to have you join our community of dedicated students working on meaningful projects that make a real impact.</p>
                
                <div class="credentials-box">
                    <div class="credentials-title">Your Login Credentials</div>
                    <div class="credential-item">
                        <span class="credential-label">Username:</span>
                        <span class="credential-value">${username}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Password:</span>
                        <span class="credential-value">${password}</span>
                    </div>
                </div>
                
                <div class="password-info">
                    <div class="password-title">🔐 Password Information</div>
                    <p>Your password follows this pattern:</p>
                    <p class="password-pattern">Username + Last 4 digits of phone number</p>
                    <p><small>Example: If username is "john" and phone ends with "1234", password would be "john1234"</small></p>
                </div>
                
                <h3>What's Next?</h3>
                <ul>
                    <li>📋 <strong>Selection Process:</strong> Our team will review your application and project preferences</li>
                    <li>📧 <strong>Notification:</strong> You will receive notification about selection results within 7-10 business days</li>
                    <li>📚 <strong>Orientation:</strong> If selected, you'll receive detailed information about project orientation and timeline</li>
                    <li>🤝 <strong>Mentorship:</strong> You'll be assigned to experienced mentors and project teams</li>
                </ul>
                
                <p><span class="important">Important:</span> Please keep your login credentials safe. You may need them to access the student portal and project resources.</p>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Thank you for your interest in the SAC Program. We look forward to working with you!</p>
            </div>
            
            <div class="footer">
                <p><strong>SAC Program Team</strong></p>
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>For support, contact us at support@sacprogram.edu</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"SAC Program" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to SAC Program - Registration Successful!',
        html: htmlTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};
