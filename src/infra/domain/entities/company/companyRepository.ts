import { CompanyInterface } from './company';

export interface CompanyRepositoryInterface {
  createCompany(companyData: CompanyInterface): Promise<void>;
}