import { Application } from 'express';
import inventoryStockRoutes from './inventoryStockRoutes';

export default {
	attach(app: Application): void {
		app.use('/v1/inventory-stocks', inventoryStockRoutes);
	},
};
