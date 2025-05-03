import { Product } from '../products/product';

export interface CreateProductInterface {
  execute(product: Product): Promise<null>
}