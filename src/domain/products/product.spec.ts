import { expect, test } from 'vitest';
import { Product } from './product';
import { IUnity } from '../unity/unity';

test('should create a new product', () => {

  const mockProduct = {
    name: 'Isabela',
    company: 'padaria',
    cost: 12.68,
    quatity: 1,
    date: String(new Date()),
    category: 'Farinha',
    unity: 'kg' as IUnity
  };
  
  const product = new Product(mockProduct);

  expect(product).instanceOf(Product);

  expect(product.name).eq('Isabela');
  expect(product.company).eq('padaria');
  expect(product.cost).eq(12.68);
  expect(product.quantity).eq(1);
  expect(product.date).eq(String(new Date()));
  expect(product.category).eq('Farinha');
  expect(product.unity).eq('kg');
});