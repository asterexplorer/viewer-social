import amqp from 'amqplib';

const QUEUE_NAME = 'notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function getChannel() {
    if (channel) return channel;

    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Handle connection errors
        connection.on('error', (err) => {
            console.error('RabbitMQ connection error', err);
            channel = null;
            connection = null;
        });

        connection.on('close', () => {
            console.warn('RabbitMQ connection closed');
            channel = null;
            connection = null;
        });

        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        return null;
    }
}

export async function sendNotification(userId: string, type: string, payload: any) {
    try {
        const ch = await getChannel();
        if (!ch) {
            console.warn('RabbitMQ channel not available, skipping notification');
            return;
        }

        const message = JSON.stringify({
            userId,
            type,
            payload,
            timestamp: new Date().toISOString()
        });

        ch.sendToQueue(QUEUE_NAME, Buffer.from(message), {
            persistent: true
        });

        console.log(`Notification sent: ${type} for user ${userId}`);
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
}
