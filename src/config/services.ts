import * as validators from '../infrastructure/validation/joi';
import { InventoryStockRepository } from '../infrastructure/adapters';

/**
 *  Structer {
 * 		entity: {
 * 			validators,
 * 			repository
 * 		}
 * 	}
 *
 */
export default {
	inventoryStock: {
		validators: validators.updateInventoryStock,
		repository: InventoryStockRepository,
	},
	utils: {},
};
