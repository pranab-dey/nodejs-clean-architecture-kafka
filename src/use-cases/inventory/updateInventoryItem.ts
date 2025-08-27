import { InventoryStock } from '../../entities';
import { IInventoryStockRepository } from '../../interfaces/repositories';
import IUseCase from '../../interfaces/useCase';

export default class updateInventoryStock implements IUseCase<InventoryStock> {
	constructor(private inventoryStockRepository: IInventoryStockRepository) {}

	async execute(
		productId: string,
		payload: Pick<InventoryStock, 'quantity'>
	): Promise<Partial<InventoryStock>> {
		const product = await this.inventoryStockRepository.getItem(productId);

		if (!product) {
			// throw new NotFoundError('Product not found');
		}

		const item = new InventoryStock(product as InventoryStock);
		item.decrementStock(payload.quantity);

		return this.inventoryStockRepository.updateStock(productId, {
			quantity: item.quantity,
		});
	}
}
