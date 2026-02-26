import pika
import os
import json
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        # Allow connection string via ENV or default to localhost
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/%2F')
        self.connection = None
        self.channel = None
        
    def connect(self):
        try:
            params = pika.URLParameters(self.rabbitmq_url)
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            
            # Ensure the queue exists
            self.channel.queue_declare(queue='notifications', durable=True)
            logger.info("Connected to RabbitMQ")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            return False

    def send_notification(self, user_id, message_type, payload):
        """
        Publish a message to the notification queue.
        payload: dict containing details (e.g., post_id, actor_name)
        """
        if not self.connection or self.connection.is_closed:
            connected = self.connect()
            if not connected:
                logger.warning("Notification skipped: RabbitMQ unavailable")
                return

        message = {
            'user_id': user_id,
            'type': message_type,
            'payload': payload,
            'timestamp': os.getenv('TIMESTAMP_MOCK', 'now') # In real implementation use actual time
        }
        
        try:
            self.channel.basic_publish(
                exchange='',
                routing_key='notifications',
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                ))
            logger.info(f"Notification sent for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to publish notification: {e}")

    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()

# Singleton instance for easy import
notification_service = NotificationService()
