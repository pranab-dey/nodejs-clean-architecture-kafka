/**
 * Kafka message broker adapter following adapter design pattern
 * Provides a clean interface for async communication between microservices
 */
import {
	Kafka,
	Producer,
	Consumer,
	KafkaMessage,
	EachMessagePayload,
} from 'kafkajs';
import { MessageBrokerPort } from '../../../ports/outbound';
import {
	IKafkaConfig,
	IKafkaConsumerConfig,
	IKafkaProducerConfig,
} from '../../../interfaces/config';
import { BrokerBaseEvent } from '../../../interfaces/events';

export default class KafkaAdapter implements MessageBrokerPort {
	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;
	private kafkaConfig: IKafkaConfig;
	private producerConfig: IKafkaProducerConfig;
	private consumerConfig: IKafkaConsumerConfig;

	private isConnected: boolean = false;
	private handlers: Map<string, (message: BrokerBaseEvent) => Promise<void>> =
		new Map();

	constructor(config: IKafkaConfig) {
		this.kafkaConfig = config;
		this.producerConfig = config.producer;
		this.consumerConfig = config.consumer;

		this.kafka = new Kafka({
			clientId: config.clientId,
			brokers: config.brokers,
			ssl: config.ssl,

			// Connection settings
			connectionTimeout: 10000, // 10 seconds
			requestTimeout: 30000, // 30 seconds

			// Retry settings
			retry: {
				initialRetryTime: 100,
				retries: 8,
				maxRetryTime: 30000,
				factor: 0.2,
			},
		});

		// Initialize producer and consumer
		this.producer = this.kafka.producer(this.producerConfig);
		this.consumer = this.kafka.consumer(this.consumerConfig);
	}

	/**
	 * Connect to Kafka
	 */
	async connect(): Promise<void> {
		if (!this.isConnected) {
			try {
				await this.producer.connect();
				await this.consumer.connect();
				this.isConnected = true;
				console.log('Kafka connected successfully');
			} catch (error) {
				console.error('Failed to connect to Kafka:', error);
				throw new Error('Kafka connection failed');
			}
		}
	}

	/**
	 * Disconnect from Kafka
	 */
	async disconnect(): Promise<void> {
		try {
			if (this.isConnected) {
				await this.consumer.disconnect();
				await this.producer.disconnect();
				this.isConnected = false;
				console.log('Kafka disconnected');
			}
		} catch (error) {
			console.error('Error disconnecting from Kafka:', error);
		}
	}

	/**
	 * Check If Kafka is connected or not
	 * @returns  - boolean
	 */
	isHealthy(): boolean {
		return this.isConnected;
	}

	/**
	 * Publish message to topic
	 * @param topic - Kafka topic
	 * @param message - Message to publish
	 */
	async publish(topic: string, message: BrokerBaseEvent): Promise<void> {
		if (!this.isHealthy) throw new Error('Kafka is not connected');

		try {
			// Serialize message
			const serializedMessage = JSON.stringify(message);

			// Publish message with metadata
			await this.producer.send({
				topic,
				messages: [
					{
						key: message.id,
						value: serializedMessage,
						headers: {
							'message-type': message.type,
							source: message.source,
							version: message.version,
							timestamp: message.timestamp.toISOString(),
							'correlation-id': message.id,
						},
					},
				],
				timeout: 30000, // 30 seconds
			});

			console.log(`Message published to topic ${topic}:`, message.type);
		} catch (error) {
			console.error('Kafka publish error:', error);
			throw new Error(`Failed to publish message to topic ${topic}`);
		}
	}

	/**
	 * Subscribe to topic with message handler
	 * @param topic - Kafka topic to subscribe to
	 * @param handler - Message handler function
	 */
	async subscribe(
		topic: string,
		handler: (message: BrokerBaseEvent) => Promise<void>
	): Promise<void> {
		try {
			await this.connect();

			// Store handler for the topic
			this.handlers.set(topic, handler);

			// Subscribe to topic
			await this.consumer.subscribe({ topic, fromBeginning: false });

			// Start consuming messages
			await this.consumer.run({
				eachMessage: async (payload: EachMessagePayload) => {
					await this.handleMessage(payload);
				},

				// Error handling
				autoCommit: true,
				autoCommitInterval: 5000,
				autoCommitThreshold: 100,

				// Message processing settings
				partitionsConsumedConcurrently: 3,
			});

			console.log(`Subscribed to topic ${topic}`);
		} catch (error) {
			console.error('Kafka subscribe error:', error);
			throw new Error(`Failed to subscribe to topic ${topic}`);
		}
	}

	/**
	 * Handle incoming Kafka message
	 * @param payload - Kafka message payload
	 */
	private async handleMessage(payload: EachMessagePayload): Promise<void> {
		const { topic, partition, message } = payload;

		try {
			// Parse message
			const messageValue = message.value?.toString();
			if (!messageValue) {
				console.warn('Received empty message from Kafka');
				return;
			}

			const event: BrokerBaseEvent = JSON.parse(messageValue);

			// Get handler for the topic
			const handler = this.handlers.get(topic);
			if (!handler) {
				console.warn(`No handler found for topic ${topic}`);
				return;
			}

			// Process message with retry logic
			await this.processMessageWithRetry(
				handler,
				event,
				topic,
				partition,
				message
			);
		} catch (error) {
			console.error('Error processing Kafka message:', error);
			await this.handleFailedMessage(payload, error); // Send to dead letter Queue when implemented
		}
	}

	/**
	 * Process message with retry logic
	 * @param handler - Message handler
	 * @param event - Event data
	 * @param topic - Topic name
	 * @param partition - Partition number
	 * @param message - Kafka message
	 */
	private async processMessageWithRetry(
		handler: (message: BrokerBaseEvent) => Promise<void>,
		event: BrokerBaseEvent,
		topic: string,
		partition: number,
		message: KafkaMessage
	): Promise<void> {
		const maxRetries = 3;
		let retryCount = 0;

		while (retryCount < maxRetries) {
			try {
				await handler(event);
				console.log(`Message processed successfully: ${event.type}`);
				return;
			} catch (error) {
				retryCount++;
				console.error(
					`Message processing failed (attempt ${retryCount}/${maxRetries}):`,
					error
				);

				if (retryCount >= maxRetries) {
					throw error;
				}

				// Exponential backoff
				await new Promise((resolve) =>
					setTimeout(resolve, Math.pow(2, retryCount) * 1000)
				);
			}
		}
	}

	/**
	 * Handle failed message processing
	 * @param payload - Kafka message payload
	 * @param error - Processing error
	 */
	private async handleFailedMessage(
		payload: EachMessagePayload,
		error: any
	): Promise<void> {
		const { topic, partition, message } = payload;

		try {
			// Publish to dead letter queue
			const deadLetterEvent: BrokerBaseEvent = {
				id: message.key?.toString() || 'unknown',
				type: 'message.failed',
				timestamp: new Date(),
				source: this.kafkaConfig.clientId,
				version: '1.0',
				data: {
					originalTopic: topic,
					partition,
					offset: message.offset,
					error: error.message,
					originalMessage: message.value?.toString(),
				},
			};

			await this.publish(`${topic}.dlq`, deadLetterEvent);
			console.log(`Message sent to dead letter queue: ${topic}.dlq`);
		} catch (dlqError) {
			console.error(
				'Failed to send message to dead letter queue:',
				dlqError
			);
		}
	}

	/**
	 * Publish message with transaction support
	 * @param topic - Kafka topic
	 * @param message - Message to publish
	 * @param transactionCallback - Callback to execute within transaction
	 */
	async publishWithTransaction<T>(
		topic: string,
		message: BrokerBaseEvent,
		transactionCallback: () => Promise<T>
	): Promise<T> {
		const transaction = await this.producer.transaction();

		try {
			// Execute transaction callback
			const result = await transactionCallback();

			// Publish message within transaction
			await transaction.send({
				topic,
				messages: [
					{
						key: message.id,
						value: JSON.stringify(message),
						headers: {
							'message-type': message.type,
							source: message.source,
							version: message.version,
							timestamp: message.timestamp.toISOString(),
						},
					},
				],
			});

			// Commit transaction
			await transaction.commit();

			return result;
		} catch (error) {
			// Abort transaction on error
			await transaction.abort();
			throw error;
		}
	}

	/**
	 * Publish message to multiple topics
	 * @param messages - Array of topic-message pairs
	 */
	async publishBatch(
		messages: Array<{ topic: string; message: BrokerBaseEvent }>
	): Promise<void> {
		try {
			await this.connect();

			const kafkaMessages = messages.map(({ topic, message }) => ({
				topic,
				messages: [
					{
						key: message.id,
						value: JSON.stringify(message),
						headers: {
							'message-type': message.type,
							source: message.source,
							version: message.version,
							timestamp: message.timestamp.toISOString(),
						},
					},
				],
			}));

			await this.producer.sendBatch({
				topicMessages: kafkaMessages,
				timeout: 30000,
			});

			console.log(`Batch published ${messages.length} messages`);
		} catch (error) {
			console.error('Kafka batch publish error:', error);
			throw new Error('Failed to publish batch messages');
		}
	}
}
