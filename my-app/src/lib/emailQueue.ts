import nodemailer from 'nodemailer';

// BullMQ has been temporarily disabled because it requires a local Redis server.
// Without Redis running locally, Next.js will crash with an ECONNREFUSED error.

/*
import { Queue, Worker } from 'bullmq';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
};
*/

// Create a dummy emailQueue so the rest of the application doesn't crash when trying to add jobs
const emailQueue = {
    add: async (name: string, data: any, opts: any) => {
        console.log(`[MOCK BULLMQ] Ignored email job: ${name}`, data.email);
        return { id: 'mock-job-id' };
    },
    on: () => {},
    close: async () => {},
};

// Create transporter for sending emails (Nodemailer does not require Redis)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 8000, 
    greetingTimeout: 8000,
    socketTimeout: 8000,
});

export { emailQueue, transporter };