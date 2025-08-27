export default interface IUseCase<T> {
	execute(...args: unknown[]): T | Promise<T> | Promise<Partial<T>>;
}
