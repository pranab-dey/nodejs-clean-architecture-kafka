export interface IDatabaseConfig {
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

export interface IRedisConfig {
	host: string;
	port: number;
	password?: string;
	db?: number;
	keyPrefix?: string;
}

export interface IKafkaConfig {
	clientId: string;
	brokers: string[];
	ssl?: boolean;
	sasl?: {
		mechanism: string;
		username: string;
		password: string;
	};
	producer: IKafkaProducerConfig;
	consumer: IKafkaConsumerConfig;
}

export interface IKafkaProducerConfig {
	allowAutoTopicCreation: boolean;
	transactionTimeout: number;
	maxInFlightRequests: number;
	idempotent: boolean;
}

export interface IKafkaConsumerConfig {
	groupId: string;
	sessionTimeout: number;
	heartbeatInterval: number;
	rebalanceTimeout: number;
	maxBytesPerPartition: number;
	retry: {
		initialRetryTime: number;
		retries: number;
		maxRetryTime: number;
		factor: number;
		randomize: boolean;
	};
}

export interface IServiceConfig {
	name: string;
	port: number;
	environment: string;
	database: IDatabaseConfig;
	redis: IRedisConfig;
	kafka: IKafkaConfig;
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
