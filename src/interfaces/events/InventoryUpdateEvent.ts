import { InventoryTransactionType } from '../../enums/InventoryTransactionType';
import KafkaBaseEvent from './BrokerBaseEvent';

export default interface InventoryUpdatedEvent extends KafkaBaseEvent {
	type: 'inventory.updated';
	data: {
		productId: string;
		quantity: number;
		transactionType: InventoryTransactionType;
	};
}
