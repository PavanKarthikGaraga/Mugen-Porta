import Bull from 'bull';
import nodemailer from 'nodemailer';

// Create email queue with Bull
const emailQueue = new Bull('emailQueue', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
    },
});

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Process email jobs from the queue
emailQueue.process(async (job) => {
    const { email, subject, html } = job.data;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw error; // This will mark the job as failed
    }
});

// Queue event handlers for monitoring
emailQueue.on('ready', () => {
    console.log('Email queue is ready and processing jobs');
    emailQueue.resume();
});

emailQueue.on('error', (error) => {
    console.error('Error in email queue:', error);
});

emailQueue.on('waiting', (jobId) => {
    console.log(`Job ${jobId} is waiting to be processed`);
});

emailQueue.on('active', (jobId, jobPromise) => {
    console.log(`Job ${jobId} is now active`);
});

emailQueue.on('completed', (jobId, result) => {
    console.log(`Job ${jobId} completed successfully`);
});

emailQueue.on('failed', (jobId, err) => {
    console.error(`Job ${jobId} failed with error:`, err.message);
});

// Export the queue for use in other files
export { emailQueue };
