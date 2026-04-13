export class AemetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AemetError';
    Object.setPrototypeOf(this, AemetError.prototype);
  }
}
