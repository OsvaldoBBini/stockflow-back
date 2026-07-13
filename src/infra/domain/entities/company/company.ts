export interface CompanyInterface {
  userId: string;
  companyName: string;
  role: 'owner' | 'admin' | 'user';
}

export interface CompanyDomainInterface extends CompanyInterface {
  companyId: string;
  isDefault?: boolean
}

export interface CompanyPersistenceInterface extends CompanyDomainInterface {
  PK: string;
  SK: string;
}