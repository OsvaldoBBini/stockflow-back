import { CompanyDomainInterface, CompanyInterface } from './company';

export interface CompanyRepositoryInterface {
  createCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface>;
}