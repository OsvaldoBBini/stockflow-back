export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabseError';
  }
}

export class UseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UseCaseError';
  }
}