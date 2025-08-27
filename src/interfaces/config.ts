export interface DatabaseConfig {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
	ssl?: boolean;
	pool?: {
		min: number;
		max: number;
	};
}

export interface RedisConfig {
	host: string;
	port: number;
	password?: string;
	db?: number;
	keyPrefix?: string;
}

export interface KafkaConfig {
	clientId: string;
	brokers: string[];
	ssl?: boolean;
	sasl?: {
		mechanism: string;
		username: string;
		password: string;
	};
}

export interface ServiceConfig {
	name: string;
	port: number;
	environment: string;
	database: DatabaseConfig;
	redis: RedisConfig;
	kafka: KafkaConfig;
	jwt: {
		secret: string;
		expiresIn: string;
		refreshExpiresIn: string;
	};
	cors: {
		origin: string | string[];
		credentials: boolean;
	};
	rateLimit: {
		windowMs: number;
		max: number;
	};
}
