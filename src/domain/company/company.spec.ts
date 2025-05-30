import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Company } from './company';

test('should initialize a organization', () => {

  const mockCompany = {
    id: randomUUID(),
    name: 'test-name',
  };
  
  const company = new Company(mockCompany);

  expect(company).instanceOf(Company);
});