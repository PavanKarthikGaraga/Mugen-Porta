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

export const sendPasswordResetEmail = async (email, name, resetLink) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - SAC Activities</title>
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
                color: #dc3545;
                font-size: 20px;
                margin: 0;
            }
            .content {
                margin-bottom: 30px;
            }
            .reset-button {
                display: inline-block;
                background-color: #dc3545;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .reset-button:hover {
                background-color: #c82333;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
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
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SAC Activities</div>
                <h1 class="title">Password Reset Request</h1>
            </div>

            <div class="content">
                <p>Hello <strong>${name}</strong>,</p>

                <p>We received a request to reset your password for your SAC Activities account. If you didn't make this request, you can safely ignore this email.</p>

                <p>To reset your password, click the button below:</p>

                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">Reset My Password</a>
                </div>

                <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>

                <div class="warning">
                    <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </div>


                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>

            <div class="footer">
                <p><strong>SAC Activities Team</strong></p>
                // <p>For support, contact us at sacactivities@kluniversity.in</p>
                <p>For support, contact us at sac@kluniversity.in</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"SAC Activities" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request - SAC Activities',
        html: htmlTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

export const sendRegistrationEmail = async (email, name, username, password, year, selectedDomain, projectDetails, clubDetails, isY22Student, isY23Student, isY24Student, isY25Student, selectedCategory = null) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Club Registration Successful - SAC Activities</title>
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
            .development-notice {
                background-color: #e8f4fd;
                border: 1px solid #bee5eb;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #0c5460;
            }
            .selection-details {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }
            .auto-generated-note {
                color: #6c757d;
                font-size: 14px;
                margin-top: 8px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SAC Activities</div>
                <h1 class="title">Registration Successful!</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                
                <p class="success">Congratulations! You have successfully registered for the SAC Activities.</p>
                
                <p>We are excited to have you join our community of dedicated students working on meaningful projects that make a real impact.</p>
                
                <div class="credentials-box">
                    <div class="credentials-title">Your Login Credentials</div>
                    <div class="credential-item">
                        <span class="credential-label">Username:</span>
                        <span class="credential-value">${username}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Password Pattern:</span>
                        <span class="credential-value">Username + Last 4 digits of phone number</span>
                    </div>
                </div>

                ${clubDetails ? `
                <div class="selection-details">
                    <h3>Your Club Selection${isY24Student ? ' (Y24)' : isY23Student ? ' (Y23)' : isY22Student ? ' (Y22)' : isY25Student ? ' (Y25)' : ''}</h3>
                    <p><strong>Club:</strong> ${clubDetails.name}</p>
                    <p><strong>Description:</strong> ${clubDetails.description}</p>
                    <p><strong>Domain:</strong> ${selectedDomain}</p>
                    ${selectedCategory ? `<p><strong>Category:</strong> ${selectedCategory}</p>` : ''}
                </div>
                ` : ''}

                ${(isY22Student || isY23Student || isY24Student) && projectDetails ? `
                <div class="selection-details">
                    <h3>Your Project Selection${isY24Student ? ' (Y24)' : isY23Student ? ' (Y23)' : isY22Student ? ' (Y22)' : ''}</h3>
                    <p><strong>Project:</strong> ${projectDetails.name}</p>
                    <p><strong>Description:</strong> ${projectDetails.description}</p>
                    <p><strong>Domain:</strong> ${selectedDomain}</p>
                    ${selectedCategory ? `<p><strong>Category:</strong> ${selectedCategory}</p>` : ''}
                    ${projectDetails.name && projectDetails.name.includes('Auto-generated') ? `<p class="auto-generated-note"><em>Note: This is an auto-generated project for your selected category.</em></p>` : ''}
                </div>
                ` : ''}

                ${isY25Student && selectedDomain === 'TEC' && !projectDetails ? `
                <div class="selection-details">
                    <h3>Your TEC Club Selection (Y25)</h3>
                    <p><strong>Note:</strong> As a Y25 student, you can only select TEC clubs, not individual projects.</p>
                    <p><strong>Club:</strong> ${clubDetails?.name || 'N/A'}</p>
                    ${selectedCategory ? `<p><strong>Category:</strong> ${selectedCategory}</p>` : ''}
                </div>
                ` : ''}

                
                <h3>What's Next?</h3>
                <ul>
                    <li><strong>Updates:</strong> Keep an eye on your email for important announcements about your ${selectedCategory ? 'category' : 'club'} activities</li>
                    <li><strong>Preparation:</strong> Start familiarizing yourself with your selected ${(isY22Student || isY23Student || isY24Student) ? 'project and domain' : 'club activities'}</li>
                    <li><strong>Community:</strong> Get ready to collaborate with fellow students and mentors in your ${selectedDomain} domain</li>
                    ${selectedCategory ? `<li><strong>Category Focus:</strong> Your activities will be focused on the ${selectedCategory} category</li>` : ''}
                </ul>
                
                <p><span class="important">Important:</span> Please keep your login credentials safe. You will need them to access the student portal once it's available.</p>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Thank you for your interest in the SAC Activities. We look forward to working with you!</p>
            </div>
            
            <div class="footer">
                <p><strong>SAC Activities Team</strong></p>
                <p>For support, contact us at sacactivities@kluniversity.in</p>
                <p>For support, contact us at sac@kluniversity.in</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"SAC Activities" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to SAC Activities - Registration Successful!',
        html: htmlTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};
