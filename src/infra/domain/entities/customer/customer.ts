export interface CustomerInterface {
  companyId: string;
  email: string | null;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}

export interface CustomerDomainInterface extends CustomerInterface {
  customerId: string;
}

export interface CustomerPersistenceInterface {
  PK: string;
  SK: string;
  companyId: string;
  email: string | null;
  fullName: string;
  cpf: string;
  phoneNumber: string;
  customerId: string;
}