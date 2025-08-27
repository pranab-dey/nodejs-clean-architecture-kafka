/**
 * ResourceProvider (Singleton)
 *
 * Provides singleton instances of infrastructure ports (DB, Cache, Broker)
 * for the inventory-service. Internally wraps shared adapters with port
 * adapters to keep the application decoupled from vendor specifics.
 */

import { IServiceConfig } from '../../interfaces/config';
import { SqlDatabasePort } from '../../ports/outbound';
import { PostgresDatabaseAdapter } from '../adapters/outbound';

export class ResourceProvider {
	private static instance: ResourceProvider | null = null;

	// Keep references to underlying shared adapters for lifecycle management
	private readonly db: SqlDatabasePort;

	private constructor(config: IServiceConfig) {
		this.db = new PostgresDatabaseAdapter(config.database);
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
