import dotenv from 'dotenv';
import { IServiceConfig } from '../interfaces/config';

dotenv.config();

export default function loadAppConfig(): IServiceConfig {
	return {
		name: 'inventory-service',
		port: Number(process.env.PORT || 3003),
		environment: process.env.NODE_ENV || 'development',
		database: {
			host: process.env.DB_HOST || 'localhost',
			port: Number(process.env.DB_PORT || 5432),
			database: process.env.DB_NAME || 'ecommerce',
			username: process.env.DB_USER || 'ecommerce_user',
			password: process.env.DB_PASSWORD || 'ecommerce_password',
			ssl: process.env.NODE_ENV === 'production',
			pool: {
				min: Number(process.env.DB_POOL_MIN || 2),
				max: Number(process.env.DB_POOL_MAX || 20),
			},
		},
		redis: {
			host: process.env.REDIS_HOST || 'localhost',
			port: Number(process.env.REDIS_PORT || 6379),
			password: process.env.REDIS_PASSWORD,
			db: Number(process.env.REDIS_DB || 0),
			keyPrefix: 'inventory-service:',
		},
		kafka: {
			clientId: 'inventory-service',
			brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
			ssl: process.env.NODE_ENV === 'production',
			sasl: process.env.KAFKA_USERNAME
				? {
						mechanism: 'PLAIN',
						username: process.env.KAFKA_USERNAME,
						password: process.env.KAFKA_PASSWORD || '',
				  }
				: undefined,
			producer: {
				allowAutoTopicCreation: true,
				transactionTimeout: 30000,
				maxInFlightRequests: 5,
				idempotent: true,
			},
			consumer: {
				groupId: `${this.kafka.clientId}-consumer-group`,
				sessionTimeout: 30000,
				heartbeatInterval: 3000,
				rebalanceTimeout: 60000,
				maxBytesPerPartition: 1048576, // 1MB
				retry: {
					initialRetryTime: 100,
					retries: 8,
					maxRetryTime: 30000,
					factor: 0.2,
					randomize: true,
				},
			},
		},
		jwt: {
			secret: process.env.JWT_SECRET_KEY || '',
			expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '',
			refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '',
		},
		cors: {
			origin: process.env.CORS_ORIGIN || '*',
			credentials: false,
		},
		rateLimit: {
			windowMs: Number(process.env.RATE_LIMIT_MS),
			max: Number(process.env.RATE_LIMIT_MAX),
		},
	};
}
