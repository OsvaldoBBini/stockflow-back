import { expect, test } from 'vitest';
import { Product } from './product';
import { IUnity } from '../unity/unity';
import { randomUUID } from 'node:crypto';

test('should create a new product', () => {

  const entryDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 1);

  const mockProduct = {
    id: randomUUID(),
    categoryId: randomUUID(),
    company: 'test-company',
    name: 'test-name',
    user: 'test-user',
    pricePaid: 30,
    quatity: 1,
    unityMeasure: 'kg' as IUnity,
    entryDate: entryDate,
    expirationDate: expirationDate,
  };
  
  const product = new Product(mockProduct);
  expect(product).instanceOf(Product);
});

test('should not create a new product due expiration date', () => {

  const entryDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 1);

  const mockProduct = {
    id: randomUUID(),
    categoryId: randomUUID(),
    company: 'test-company',
    name: 'test-name',
    user: 'test-user',
    pricePaid: 30,
    quatity: 1,
    unityMeasure: 'kg' as IUnity,
    entryDate: entryDate,
    expirationDate: expirationDate,
  };

  expect(
    () => {return new Product(mockProduct);
    }).toThrow();

});

