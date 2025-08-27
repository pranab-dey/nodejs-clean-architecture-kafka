import { InventoryStock } from '../entities';
import { IRequest, IUseCase } from '../interfaces';

export default class InventoryStockController {
	constructor(protected updateInventoryStock: IUseCase<InventoryStock>) {}

	async update(request: IRequest): Promise<Partial<InventoryStock>> {
		const productId = parseInt(request.params?.productId as string);
		return this.updateInventoryStock.execute(productId, request.body);
	}
}
