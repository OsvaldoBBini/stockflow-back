import { Product } from '../../../domain/products/product';
import { ProductsRepositoryInterface } from '../../../domain/repositories/productsRepository';
import { CategoriesRepositoryInterface } from '../../../domain/repositories/categoriesRepository';
import { CreateProductInterface } from '../../../domain/use-cases/createProduct';
import { UseCaseError } from '../../../errors/errors';

export class CreateProduct implements CreateProductInterface {

  productsRepository: ProductsRepositoryInterface;
  categoriesRepository: CategoriesRepositoryInterface;
  
  constructor(
    productsRepository: ProductsRepositoryInterface,
    categoriesRepository: CategoriesRepositoryInterface
  ) {
    this.productsRepository = productsRepository;
    this.categoriesRepository = categoriesRepository;
  }

  async execute(product: Product) {
    try{
      const isAValidCategory = await this.categoriesRepository.getCategoryById(product.categoryId);
      if (!isAValidCategory) {
        throw new Error('Category not valid');
      } 
      await this.productsRepository.insertNewProduct(product);
    } catch(error) {
      throw new UseCaseError(`Not able to register your product due to: ${String(error)}`);
    }
    return null;
  }
}