import * as validators from '../infrastructure/validation/joi';
import { InventoryStockRepository } from '../infrastructure/adapters/repositories';

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
