export default interface BrokerBaseEvent {
	id: string;
	type: string;
	timestamp: Date;
	source: string;
	version: string;
	data: any;
}
