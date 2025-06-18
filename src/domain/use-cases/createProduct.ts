import { Product } from '../products/product';

export interface CreateProductInterface {
  execute(product: Product, userId: string): Promise<null>
}