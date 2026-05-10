export interface CustomerInterface {
  email?: string;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}

export interface CustomerDomainInterface extends CustomerInterface {
  userId: string;
}

export interface CustomerPersistenceInterface {
  PK: string;
  SK: string;
  userId: string;
  email?: string;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}