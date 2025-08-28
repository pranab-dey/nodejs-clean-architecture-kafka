export default interface IError {
	name: string;
	message: string;
	statusCode: number;
	details?: unknown;
}
