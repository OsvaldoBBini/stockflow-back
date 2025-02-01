import { expect, test } from 'vitest';
import { Product } from './product';

test('should create a new product', () => {

  const mockProduct = {
    name: 'Farinha'
  };
  
  const product = new Product(mockProduct);

  expect(product).instanceOf(Product);
  expect(product.name).eq('Farinha');
});