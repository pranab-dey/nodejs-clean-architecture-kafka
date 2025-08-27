import express, { NextFunction, Request, Response, Router } from 'express';
import { services } from '../../../../config';
import { InventoryStockController } from '../../../../controllers';
import { updateInventoryStock } from '../../../../use-cases/inventory';
import { ResourceProvider } from '../../ResourceProvider';

const resourceProvider = ResourceProvider.get();

const inventoryRepository = new services.inventoryStock.repository(
	resourceProvider.getPostGreSQLDatabase()
);

const controller = new InventoryStockController(
	services.inventoryStock.validators,
	new updateInventoryStock(inventoryRepository)
);

const router: Router = express.Router();

router.patch(
	'/:productId',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { productId } = req.params;
			const { quantity } = req.body;

			const result = await controller.update({
				token: '',
				params: { productId },
				body: { quantity },
			});

			res.send(result);
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
