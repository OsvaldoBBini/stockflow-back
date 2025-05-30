import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { CompanyUser, IRole } from './companyUser';

test('should initialize a organization', () => {

  const mockCompanyUser = {
    userId: randomUUID(),
    companyId: randomUUID(),
    role: 'ADMIN' as IRole,
  };
  
  const companyUser = new CompanyUser(mockCompanyUser);

  expect(companyUser).instanceOf(CompanyUser);
});