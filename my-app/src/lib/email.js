import { transporter } from './emailQueue';

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
                <p>For support, contact us at sac@kluniversity.in</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        // Send email directly (not using Redis queue due to compatibility issues)
        console.log('🔄 Sending password reset email directly...');

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset Request - SAC Activities',
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent successfully to ${email}. Message ID: ${info.messageId}`);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

export const sendRegistrationEmail = async (email, name, username, password, year, selectedDomain, clubDetails, isY22Student, isY23Student, isY24Student, isY25Student) => {
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

                <p>We are excited to have you join our community of dedicated students working on meaningful activities that make a real impact.</p>

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
                </div>
                ` : ''}


                <h3>What's Next?</h3>
                <ul>
                    <li><strong>Updates:</strong> Keep an eye on your email for important announcements about your club activities</li>
                    <li><strong>Preparation:</strong> Start familiarizing yourself with your selected club activities</li>
                    <li><strong>Community:</strong> Get ready to collaborate with fellow students and mentors in your ${selectedDomain} domain</li>
                </ul>

                <p><span class="important">Important:</span> Please keep your login credentials safe. You will need them to access the student portal once it's available.</p>

                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                <p>Thank you for your interest in the SAC Activities. We look forward to working with you!</p>
            </div>

            <div class="footer">
                <p><strong>SAC Activities Team</strong></p>
                <p>For support, contact us at sac@kluniversity.in</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        // [TEMPORARILY DISABLED REGISTRATION EMAILS]
        console.log('🔄 Registration emails are temporarily disabled. Simulating success...');
        return { success: true, messageId: 'simulated_id' };

        /*
        // Send email directly (not using Redis queue due to compatibility issues)
        console.log('🔄 Sending registration email directly...');

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Welcome to SAC Activities - Registration Successful!',
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Registration email sent successfully to ${email}. Message ID: ${info.messageId}`);

        return { success: true, messageId: info.messageId };
        */
    } catch (error) {
        console.error('Error sending registration email:', error);
        return { success: false, error: error.message };
    }
};

export const sendTestWelcomeEmail = async (email) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SAMAM</title>
    </head>
    <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; color: #3f3f46; line-height: 1.6;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
                <td style="background-color: #970003; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">SAMAM</h1>
                    <p style="color: #fca5a5; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">Student Activity Center (SAC)</p>
                </td>
            </tr>

            <!-- Body Content -->
            <tr>
                <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 24px 0; color: #18181b; font-size: 24px; text-align: center;">Your Journey Beyond the Classroom Begins Today!</h2>
                    
                    <p style="margin: 0 0 16px 0; font-size: 16px;">Dear Students,</p>
                    
                    <p style="margin: 0 0 16px 0; font-size: 16px;">Welcome to the <strong>Student Activity Management and Achievement Model (SAMAM)</strong> – an innovative student development ecosystem designed to help you discover your potential, develop future-ready competencies, and create a meaningful impact both within and beyond the University.</p>
                    
                    <p style="margin: 0 0 32px 0; font-size: 16px;">At SAMAM, we believe that education extends beyond classrooms. Every activity you participate in, every challenge you undertake, every leadership role you accept, and every community you serve contributes to your personal, professional, and societal growth.</p>

                    <!-- What is SAMAM -->
                    <h3 style="margin: 0 0 12px 0; color: #970003; font-size: 20px;">What is SAMAM?</h3>
                    <p style="margin: 0 0 16px 0; font-size: 16px;">SAMAM is a competency-based student development framework that transforms traditional extracurricular activities into structured learning experiences. Every approved activity is designed to help you build valuable knowledge, practical skills, leadership abilities, innovation capabilities, and social responsibility.</p>
                    <p style="margin: 0 0 32px 0; font-size: 16px;">Whether you aspire to become a software engineer, entrepreneur, researcher, artist, sportsperson, innovator, or community leader, SAMAM provides opportunities to support your journey.</p>

                    <!-- What You Can Expect -->
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                        <h3 style="margin: 0 0 16px 0; color: #970003; font-size: 18px;">What You Can Expect</h3>
                        <p style="margin: 0 0 12px 0; font-size: 16px;">Through SAMAM, you will have opportunities to:</p>
                        <ul style="margin: 0; padding-left: 20px; font-size: 15px; color: #52525b;">
                            <li style="margin-bottom: 8px;">Participate in flagship technical, leadership, innovation, research, cultural, wellness, and community engagement programmes.</li>
                            <li style="margin-bottom: 8px;">Join clubs and professional communities aligned with your interests.</li>
                            <li style="margin-bottom: 8px;">Develop leadership through student-led initiatives and governance.</li>
                            <li style="margin-bottom: 8px;">Earn Student Development Credits (SDCs) through meaningful participation.</li>
                            <li style="margin-bottom: 8px;">Build competencies recognized by the University and industry.</li>
                            <li style="margin-bottom: 8px;">Maintain a digital portfolio showcasing your achievements.</li>
                            <li style="margin-bottom: 8px;">Contribute to innovation, research, entrepreneurship, and sustainable development.</li>
                            <li>Engage with faculty mentors, industry experts, alumni, and community partners.</li>
                        </ul>
                    </div>

                    <!-- Your Development Journey -->
                    <h3 style="margin: 0 0 16px 0; color: #970003; font-size: 20px;">Your Development Journey</h3>
                    <p style="margin: 0 0 16px 0; font-size: 16px;">Your SAMAM journey is built on four simple principles:</p>
                    <div style="background-color: #fef2f2; border-left: 4px solid #970003; padding: 20px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
                            <tr><td style="padding-bottom: 12px;">🚀 <strong>Learn:</strong> Gain new knowledge and perspectives.</td></tr>
                            <tr><td style="padding-bottom: 12px;">🌟 <strong>Lead:</strong> Take responsibility and inspire others.</td></tr>
                            <tr><td style="padding-bottom: 12px;">💡 <strong>Innovate:</strong> Solve real-world problems creatively.</td></tr>
                            <tr><td>🤝 <strong>Serve:</strong> Make a positive impact on society.</td></tr>
                        </table>
                    </div>
                    <p style="margin: 0 0 32px 0; font-size: 16px;">Every experience becomes part of your growth story.</p>

                    <!-- Student-Centric. Faculty-Mentored. -->
                    <h3 style="margin: 0 0 12px 0; color: #970003; font-size: 20px;">Student-Centric. Faculty-Mentored.</h3>
                    <p style="margin: 0 0 8px 0; font-size: 16px;">SAMAM is designed around a simple philosophy:</p>
                    <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold; color: #18181b; font-style: italic; text-align: center; background-color: #f4f4f5; padding: 12px; border-radius: 6px;">"Students lead. Faculty mentor. Learning never stops."</p>
                    <p style="margin: 0 0 32px 0; font-size: 16px;">You are encouraged to explore new opportunities, collaborate across disciplines, take initiative, and challenge yourself to achieve excellence.</p>

                    <!-- Make Every Activity Count -->
                    <h3 style="margin: 0 0 12px 0; color: #970003; font-size: 20px;">Make Every Activity Count</h3>
                    <p style="margin: 0 0 12px 0; font-size: 16px;">Each activity under SAMAM is an opportunity to:</p>
                    <ul style="margin: 0 0 32px 0; padding-left: 20px; font-size: 15px; color: #52525b;">
                        <li style="margin-bottom: 6px;">Learn something new.</li>
                        <li style="margin-bottom: 6px;">Build lifelong competencies.</li>
                        <li style="margin-bottom: 6px;">Develop leadership and teamwork.</li>
                        <li style="margin-bottom: 6px;">Strengthen communication & problem-solving.</li>
                        <li style="margin-bottom: 6px;">Expand your professional network.</li>
                        <li>Create lasting memories and impact.</li>
                    </ul>

                    <!-- Begin Your Journey -->
                    <h3 style="margin: 0 0 12px 0; color: #970003; font-size: 20px;">Begin Your Journey</h3>
                    <p style="margin: 0 0 12px 0; font-size: 16px;">We encourage you to:</p>
                    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 15px; color: #52525b;">
                        <li style="margin-bottom: 8px;">Complete your SAMAM profile.</li>
                        <li style="margin-bottom: 8px;">Explore available clubs and domains.</li>
                        <li style="margin-bottom: 8px;">Register for activities that match your interests.</li>
                        <li style="margin-bottom: 8px;">Connect with your faculty mentors and student leaders.</li>
                        <li style="margin-bottom: 8px;">Participate actively and consistently.</li>
                        <li>Build your personal development portfolio from day one.</li>
                    </ul>

                    <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 500; color: #18181b;">Remember, your university life is not measured only by grades, but also by the experiences you embrace, the skills you develop, the people you inspire, and the difference you make.</p>
                    
                    <p style="margin: 0 0 32px 0; font-size: 16px;">We are excited to be part of your journey and look forward to witnessing your growth, achievements, and contributions through SAMAM.</p>
                    
                    <!-- CTA Button -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                        <tr>
                            <td align="center">
                                <a href="https://sacactivities.kluniversity.in/auth/login" style="background-color: #970003; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(151, 0, 3, 0.25);">Login to Dashboard</a>
                            </td>
                        </tr>
                    </table>

                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #18181b; text-align: center;">Welcome to a future of learning, leadership, innovation, and impact.</p>
                    <p style="margin: 0 0 40px 0; font-size: 16px; text-align: center; color: #52525b;">We wish you a successful and fulfilling journey.</p>
                    
                    <!-- Sign off -->
                    <div style="border-top: 1px solid #e4e4e7; padding-top: 24px;">
                        <p style="margin: 0 0 4px 0; font-size: 16px;">Warm regards,</p>
                        <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #970003;">Student Activity Center (SAC)</p>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #52525b;">SAMAM – Student Activity Management and Achievement Model</p>
                        <p style="margin: 0; font-size: 14px; font-style: italic; color: #71717a;">Empowering Students. Inspiring Leadership. Creating Impact.</p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background-color: #f4f4f5; padding: 30px; text-align: center; border-top: 1px solid #e4e4e7;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #a1a1aa;">This email was sent by the Student Activity Center.</p>
                    <p style="margin: 0; font-size: 12px; color: #d4d4d8;">&copy; 2026 KL University SAC. All rights reserved.</p>
                </td>
            </tr>
        </table>
        
    </body>
    </html>
    `;

    try {
        console.log('🔄 Sending test welcome email via ZeptoMail API...');

        const zeptoUrl = "https://api.zeptomail.in/v1.1/email";
        const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;

        if (!zeptoToken) {
            throw new Error("ZEPTO_MAIL_TOKEN is missing in environment variables. Please add it to your .env file.");
        }

        const payload = {
            from: {
                // Must be a verified domain in ZeptoMail
                address: process.env.SMTP_FROM || "noreply@samam.com",
                name: "SAC Activities"
            },
            to: [
                {
                    email_address: {
                        address: email,
                        name: "Student"
                    }
                }
            ],
            subject: 'Welcome to SAMAM – Your Journey Beyond the Classroom Begins Today!',
            htmlbody: htmlTemplate,
        };

        const response = await fetch(zeptoUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': zeptoToken.toLowerCase().startsWith('zoho-enczapikey') ? zeptoToken : `Zoho-enczapikey ${zeptoToken}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Test welcome email sent successfully via ZeptoMail. Response:`, data.message);
            return { success: true, messageId: data.data?.[0]?.request_id || "zepto-success" };
        } else {
            console.error('❌ ZeptoMail Error:', data);
            throw new Error(data.error?.message || "Failed to send email via ZeptoMail API");
        }
    } catch (error) {
        console.error('Error sending test welcome email:', error);
        return { success: false, error: error.message };
    }
};
