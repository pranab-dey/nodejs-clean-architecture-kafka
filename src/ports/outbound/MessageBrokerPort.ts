import { BrokerBaseEvent } from '../../interfaces/events';

export interface MessageBrokerPort {
	publish(topic: string, message: BrokerBaseEvent): Promise<void>;

	subscribe(
		topic: string,
		handler: (message: BrokerBaseEvent) => Promise<void>
	): Promise<void>;

	connect(): Promise<void>;

	disconnect(): Promise<void>;

	isHealthy(): boolean;
}
