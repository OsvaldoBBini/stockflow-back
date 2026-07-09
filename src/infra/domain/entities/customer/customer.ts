export interface CustomerInterface {
  companyId: string;
  email?: string;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}

export interface CustomerDomainInterface extends CustomerInterface {
  companyId: string;
}

export interface CustomerPersistenceInterface {
  PK: string;
  SK: string;
  companyId: string;
  email?: string;
  fullName: string;
  cpf: string;
  phoneNumber: string;
}