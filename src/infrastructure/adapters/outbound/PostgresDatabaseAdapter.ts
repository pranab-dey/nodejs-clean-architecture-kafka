import { Pool, PoolClient } from 'pg';
import { IDatabaseConfig } from '../../../interfaces/config';
import { SqlDatabasePort, QueryResult } from '../../../ports/outbound';

export default class PostgresDatabaseAdapter implements SqlDatabasePort {
	private pool: Pool;
	private config: IDatabaseConfig;

	constructor(config: IDatabaseConfig) {
		this.config = config;

		this.pool = new Pool({
			host: config.host,
			port: config.port,
			database: config.database,
			user: config.username,
			password: config.password,
			ssl: config.ssl ? { rejectUnauthorized: false } : false,

			min: config.pool?.min || 2,
			max: config.pool?.max || 20,

			connectionTimeoutMillis: 10000,
			idleTimeoutMillis: 30000,
			maxUses: 7500,

			statement_timeout: 30000,

			application_name: 'inventory-service',
		});

		this.pool.on('error', (err) => {
			console.error('Unexpected error on idle client', err);
			process.exit(-1);
		});

		process.on('SIGINT', () => this.close());
		process.on('SIGTERM', () => this.close());
	}

	/**
	 * Get a client from the pool for transaction operations
	 * @returns Promise<PoolClient> - Database client
	 */
	async getClient(): Promise<PoolClient> {
		try {
			return await this.pool.connect();
		} catch (error) {
			console.error('Failed to get database client:', error);
			// throw new AppError('Database connection failed', 500);
			// remove below
			return {} as PoolClient;
		}
	}

	/**
	 * Execute a query with parameters
	 * @param text - SQL query text
	 * @param params - Query parameters
	 * @returns Promise<QueryResult<T>> - Query result
	 */
	async query<T = any>(
		text: string,
		params?: any[]
	): Promise<QueryResult<T>> {
		return {} as QueryResult;
	}

	/**
	 * Execute operations within a transaction with automatic rollback on error
	 * @param callback - Function to execute within transaction
	 * @returns Promise<T> - Result of the transaction
	 */
	async transaction<T>(
		callback: (client: PoolClient) => Promise<T>
	): Promise<T> {
		const client = await this.getClient();

		try {
			// Start transaction
			await client.query('BEGIN');

			// Execute the callback function
			const result = await callback(client);

			// Commit transaction
			await client.query('COMMIT');

			return result;
		} catch (error) {
			// Rollback transaction on error
			await client.query('ROLLBACK');
			console.error('Transaction failed, rolled back:', error);
			throw error;
		} finally {
			// Release client back to pool
			client.release();
		}
	}

	/**
	 * Health check for database connectivity
	 */
	async isHealthy(): Promise<boolean> {
		try {
			await this.query('SELECT 1');
			return true;
		} catch (error) {
			console.error('Database health check failed:', error);
			return false;
		}
	}

	/**
	 * Close the database connection pool
	 */
	async close(): Promise<void> {
		try {
			await this.pool.end();
			console.log('Database connection pool closed');
		} catch (error) {
			console.error('Error closing database pool:', error);
		}
	}
}
