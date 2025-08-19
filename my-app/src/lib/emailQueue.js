// Email Queue System for handling high-volume email sending
class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.batchSize = 10; // Process 10 emails at a time
        this.processingDelay = 100; // 100ms delay between batches
    }

    // Add email to queue
    add(emailData) {
        this.queue.push(emailData);
        console.log(`Email queued for ${emailData.email}. Queue size: ${this.queue.length}`);
        
        // Start processing if not already running
        if (!this.processing) {
            this.processQueue();
        }
    }

    // Process emails in batches
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;
        console.log(`Starting email queue processing. Queue size: ${this.queue.length}`);

        while (this.queue.length > 0) {
            // Get batch of emails
            const batch = this.queue.splice(0, this.batchSize);
            
            // Process batch in parallel
            const promises = batch.map(async (emailData) => {
                try {
                    const { sendRegistrationEmail } = await import('@/lib/email');
                    const result = await sendRegistrationEmail(
                        emailData.email, 
                        emailData.name, 
                        emailData.username, 
                        emailData.password
                    );
                    
                    if (result.success) {
                        console.log(`✅ Email sent successfully to ${emailData.email}`);
                    } else {
                        console.error(`❌ Failed to send email to ${emailData.email}:`, result.error);
                        // Could implement retry logic here
                    }
                    
                    return result;
                } catch (error) {
                    console.error(`❌ Error sending email to ${emailData.email}:`, error);
                    return { success: false, error: error.message };
                }
            });

            // Wait for batch to complete
            await Promise.allSettled(promises);
            
            // Small delay between batches to prevent overwhelming email service
            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.processingDelay));
            }
        }

        this.processing = false;
        console.log('✅ Email queue processing completed');
    }

    // Get queue status
    getStatus() {
        return {
            queueSize: this.queue.length,
            processing: this.processing
        };
    }
}

// Global email queue instance
const emailQueue = new EmailQueue();

export { emailQueue };
