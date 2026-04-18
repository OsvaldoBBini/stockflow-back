export interface CustomerInterface {
  email?: string;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}

export interface CustomerDomainInterface extends CustomerInterface {
  userId: string;
}

export interface CustomerRepositoryInterface {
  PK: string;
  SK: string;
  email?: string;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}