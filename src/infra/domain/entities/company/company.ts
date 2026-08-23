export interface CompanyInterface {
  companyId?: string;
  cnpj: string; 
  userId: string;
  companyName: string;
  role: 'owner' | 'admin' | 'user';
  isDefault: boolean
}

export interface CompanyDomainInterface extends CompanyInterface {
  companyId: string;
}

export interface CompanyPersistenceInterface extends CompanyDomainInterface {
  PK: string;
  SK: string;
}