import Joi from 'joi';
import { IValidator, IValidationResult } from '../../../interfaces';

export default class JOIValidator<T> implements IValidator<T> {
	constructor(protected schema: Joi.ObjectSchema<T>) {}

	validate(data: T): IValidationResult<T> {
		const result = this.schema.validate(data);
		const errors = result.error
			? result.error.details.map((i) => ({
					field: i.path.join('.'),
					message: i.message,
			  }))
			: [];

		return { data: result.value, errors };
	}
}
