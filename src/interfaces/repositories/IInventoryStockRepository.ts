import { InventoryStock } from '../../entities';

export default interface IInventoryStockRepository {
	getItem(productId: string): Promise<InventoryStock | null>;

	addStock(payload: Partial<InventoryStock>): Promise<InventoryStock>;

	updateStock(
		id: string,
		payload: Pick<InventoryStock, 'quantity'>
	): Promise<Partial<InventoryStock>>;
}
