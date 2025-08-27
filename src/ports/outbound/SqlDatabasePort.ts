export interface QueryResult<T = any> {
	rows: T[];
}

export interface TransactionClient {
	query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
}

export interface SqlDatabasePort {
	query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
	transaction<T>(fn: (client: TransactionClient) => Promise<T>): Promise<T>;
	isHealthy(): Promise<boolean>;
	close(): Promise<void>;
}
