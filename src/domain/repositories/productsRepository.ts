import { Product } from '../products/product';

export interface ProductsRepositoryInterface {
  insertNewProduct(product: Product): Promise<null>;
}