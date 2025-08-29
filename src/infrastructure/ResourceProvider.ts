/**
 * ResourceProvider (Singleton)
 *
 * Provides singleton instances of infrastructure ports (DB, Cache, Broker)
 * for the inventory-service. Internally wraps shared adapters with port
 * adapters to keep the application decoupled from vendor specifics.
 */

import { IServiceConfig } from '../interfaces/config';
import { MessageBrokerPort, SqlDatabasePort } from '../ports/outbound';
import { PostgresDatabaseAdapter } from './adapters/outbound';
import KafkaAdapter from './adapters/outbound/KafkaAdapter';

export class ResourceProvider {
	private static instance: ResourceProvider | null = null;

	// Keep references to underlying shared adapters for lifecycle management
	private readonly db: SqlDatabasePort;
	private readonly broker: MessageBrokerPort;

	private constructor(config: IServiceConfig) {
		this.db = new PostgresDatabaseAdapter(config.database);
		this.broker = new KafkaAdapter(config.kafka);
	}

	public static init(config: IServiceConfig): ResourceProvider {
		if (!ResourceProvider.instance) {
			ResourceProvider.instance = new ResourceProvider(config);
		}
		return ResourceProvider.instance;
	}

	public static get(): ResourceProvider {
		if (!ResourceProvider.instance) {
			throw new Error(
				'ResourceProvider not initialized. Call init(config) first.'
			);
		}
		return ResourceProvider.instance;
	}

	public getPostGreSQLDatabase(): SqlDatabasePort {
		return this.db;
	}

	public async close(): Promise<void> {
		await Promise.all([this.db.close()]);
	}
}
