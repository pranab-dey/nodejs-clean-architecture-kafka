import Joi from 'joi';
import JOIValidator from '../validator';

const updateStockValidatorSchema = Joi.object({
	quantity: Joi.number().integer().min(1).required(),
});

export default new JOIValidator(updateStockValidatorSchema);
