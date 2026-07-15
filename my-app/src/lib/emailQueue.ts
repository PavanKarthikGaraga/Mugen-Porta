import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';

// Validate environment variables on startup
// const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_USERNAME', 'REDIS_PASSWORD', 'SMTP_USER', 'SMTP_PASS'];
// const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingVars.length > 0) {
//     console.error('❌ Missing required environment variables:', missingVars);
//     console.error('Please ensure all required environment variables are set in your .env file');
//     throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
// }

// console.log('✅ Environment variables validated');
// console.log(`🔗 Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
// console.log(`📧 SMTP: ${process.env.SMTP_USER ? 'Configured' : 'Missing'}`);

// BullMQ will create its own Redis connection internally using ioredis
// This ensures compatibility and proper connection management
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
};

console.log('🔗 BullMQ Redis config:', {
    host: redisConfig.host,
    port: redisConfig.port,
    // username: redisConfig.username ? '[SET]' : '[MISSING]',
    password: redisConfig.password ? '[SET]' : '[MISSING]',
});

// Create email queue with BullMQ using connection config (BullMQ creates ioredis internally)
const emailQueue = new Queue('mugenEmailQueue', {
    connection: redisConfig,
    defaultJobOptions: {
        removeOnComplete: 50, // Keep only last 50 completed jobs
        removeOnFail: 100,    // Keep only last 100 failed jobs
        attempts: 3,          // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 5000,      // 5 seconds initial delay
        },
    },
});

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 8000, // 8 seconds timeout to prevent 504 Gateway errors
    greetingTimeout: 8000,
    socketTimeout: 8000,
});

// Create worker to process email jobs using the same Redis connection config
const emailWorker = new Worker('mugenEmailQueue',
    async (job) => {
        const { email, subject, html } = job.data;
        const jobId = job.id;

        console.log(`🔄 Processing email job ${jobId} for ${email}`);

        // Validate job data
        if (!email || !subject || !html) {
            throw new Error(`Invalid job data: missing email, subject, or html content`);
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: subject,
            html: html,
        };

        try {
            console.log(`📧 Sending email to ${email} with subject: "${subject}"`);
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to ${email}. Message ID: ${info.messageId}`);

            return {
                success: true,
                messageId: info.messageId,
                recipient: email,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error sending email to ${email}:`, {
                error: error.message,
                code: error.code,
                command: error.command,
                jobId: jobId,
                attempt: job.attemptsMade + 1
            });

            // Provide more specific error messages
            if (error.code === 'EAUTH') {
                throw new Error('SMTP authentication failed. Check SMTP credentials.');
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('SMTP connection refused. Check SMTP server configuration.');
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error('SMTP connection timed out. Check network connectivity.');
            }

            throw error; // Re-throw for BullMQ to handle retries
        }
    },
    {
        connection: redisConfig,
        concurrency: 3, // Process up to 3 emails simultaneously
        limiter: {
            max: 10,      // Maximum 10 jobs
            duration: 1000, // per 1 second
        },
    }
);

// Worker event handlers for monitoring
emailWorker.on('ready', () => {
    console.log('🚀 Email worker is ready and processing jobs');
});

emailWorker.on('error', (error) => {
    console.error('💥 Error in email worker:', error);
    console.error('Worker error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
    });
});

emailWorker.on('active', (job) => {
    console.log(`⚡ Job ${job.id} is now active and being processed`);
});

emailWorker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed successfully`, {
        messageId: result?.messageId,
        recipient: result?.recipient
    });
});

emailWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, {
        message: err.message,
        stack: err.stack,
        attemptsMade: job.attemptsMade,
        attemptsRemaining: job.opts?.attempts - (job.attemptsMade || 0)
    });
});

emailWorker.on('stalled', (jobId) => {
    console.warn(`⚠️ Job ${jobId} has stalled - this usually means the worker crashed`);
});

// Queue event handlers
emailQueue.on('waiting', (jobId) => {
    console.log(`⏳ Job ${jobId} is waiting to be processed`);
});

emailQueue.on('cleaned', (jobs, type) => {
    console.log(`🧹 Cleaned ${jobs.length} ${type} jobs from queue`);
});

emailQueue.on('error', (error) => {
    console.error('💥 Queue error:', error);
});

emailQueue.on('waiting-children', (job) => {
    console.log(`👶 Job ${job.id} is waiting for children to complete`);
});

// BullMQ handles Redis connection health monitoring internally

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, gracefully shutting down...');
    try {
        await emailWorker.close();
        await emailQueue.close();
        console.log('✅ Email system shut down successfully');
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, gracefully shutting down...');
    try {
        await emailWorker.close();
        await emailQueue.close();
        console.log('✅ Email system shut down successfully');
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
    }
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Export the queue and transporter for use in other files
export { emailQueue, transporter };