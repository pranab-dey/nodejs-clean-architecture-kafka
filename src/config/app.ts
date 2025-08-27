import dotenv from 'dotenv';
import { IServiceConfig } from '../interfaces/config';

dotenv.config();

export function loadAppConfig(): IServiceConfig {
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
