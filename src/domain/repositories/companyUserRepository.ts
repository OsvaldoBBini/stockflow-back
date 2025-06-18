import { UUID } from 'node:crypto';
import { CompanyUser } from '../companyUser/companyUser';

export interface CompanyUserRepositoryInterface {
  getUserCompanyRole(userId: UUID, companyId: UUID): Promise<CompanyUser> 
}