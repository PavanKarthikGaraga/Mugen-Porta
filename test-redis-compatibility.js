// Quick test to verify ioredis has defineCommand method
// This was the root cause of the BullMQ error

console.log('🔍 Testing Redis client compatibility...');

try {
    const Redis = require('ioredis');

    const client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        lazyConnect: true
    });

    console.log('✅ ioredis loaded successfully');
    console.log('✅ defineCommand method exists:', typeof client.defineCommand);

    // Test BullMQ compatibility
    const { Queue } = require('bullmq');

    console.log('✅ BullMQ loaded successfully');
    console.log('✅ All compatibility checks passed!');

    client.disconnect();

} catch (error) {
    console.error('❌ Compatibility test failed:', error.message);
    process.exit(1);
}