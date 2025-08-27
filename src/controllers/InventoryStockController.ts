import { InventoryStock } from '../entities';
import { IRequest, IUseCase, IValidator } from '../interfaces';

export default class InventoryStockController {
	constructor(
		protected validator: IValidator<Partial<InventoryStock>>,
		protected updateInventoryStockUseCase: IUseCase<InventoryStock>
	) {}

	async update(request: IRequest): Promise<Partial<InventoryStock>> {
		const productId = request.params?.productId as string;

		const { data, errors } = this.validator.validate(
			request.body as Partial<InventoryStock>
		);

		// if (errors && errors.length > 0) {
		// 	throw new ValidationError('The data is invalid', errors);
		// }

		return this.updateInventoryStockUseCase.execute(productId, data);
	}
}
