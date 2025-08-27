export default class BaseEntity<T> {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;

	private version: number = 7;

	constructor(attrs?: Partial<T>) {
		this.id = `${Date.now().toString(16).padStart(12, '0')}-${
			this.version
		}${Math.random().toString(16).slice(2, 6)}-${Math.random()
			.toString(16)
			.slice(2, 10)}`;

		this.createdAt =
			(attrs as any)?.createdAt ?? new Date(new Date().toISOString());

		this.updatedAt =
			(attrs as any)?.updatedAt ?? new Date(new Date().toISOString());

		this.deletedAt = (attrs as any)?.deletedAt;

		if (attrs) {
			Object.assign(this, attrs);
		}
	}

	softDelete() {
		this.deletedAt = new Date(new Date().toISOString());
	}

	restore() {
		this.deletedAt = undefined;
	}

	isDeleted(): boolean {
		return !!this.deletedAt;
	}
}
