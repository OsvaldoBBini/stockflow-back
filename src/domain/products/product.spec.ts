import { expect, test } from 'vitest';
import { Product } from './product';
import { IUnity } from '../unity/unity';
import { randomUUID } from 'node:crypto';

test('should create a new product', () => {

  const mockProduct = {
    id: randomUUID(),
    category: 'test-category',
    company: 'test-company',
    name: 'test-name',
    user: 'test-user',
    pricePaid: 30,
    quatity: 1,
    unityMeasure: 'kg' as IUnity,
    date: String(new Date()),
  };
  
  const product = new Product(mockProduct);
  expect(product).instanceOf(Product);
});