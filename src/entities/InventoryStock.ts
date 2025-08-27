import BaseEntity from './BaseEntity';

export default class InventoryStock extends BaseEntity<InventoryStock> {
	warehouseId!: string;
	productId!: string;
	quantity!: number;

	// business rules or validations
	decrementStock(amount: number) {
		if (amount > this.quantity) {
			throw new Error('quantity exceeds the stock');
		}

		this.quantity -= amount;
	}
}
