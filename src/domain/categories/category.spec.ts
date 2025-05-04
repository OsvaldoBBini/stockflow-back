import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Category } from './category';

test('should initialize a category', () => {

  const mockCategory = {
    id: randomUUID(),
    name: 'test-name',
    description: 'test-description',
    user: 'test-user',
    companyId: randomUUID()
  };
  
  const category = new Category(mockCategory);

  expect(category).instanceOf(Category);
});