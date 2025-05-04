import { expect, test } from 'vitest';
import { Product } from './product';
import { successMockProduct, errorMockProduct } from '../../tests/configs'; 

test('should create a new product', () => {
  const product = new Product(successMockProduct);
  expect(product).instanceOf(Product);
});

test('should not create a new product due expiration date', () => {
  expect(() => {return new Product(errorMockProduct);}).toThrow();
});

