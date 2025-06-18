import { Product } from '../../../domain/products/product';
import { ProductsRepositoryInterface } from '../../../domain/repositories/productsRepository';
import { CategoriesRepositoryInterface } from '../../../domain/repositories/categoriesRepository';
import { CreateProductInterface } from '../../../domain/use-cases/createProduct';
import { UseCaseError } from '../../../errors/errors';
import { CompanyUserRepositoryInterface } from '../../../domain/repositories/companyUserRepository';

export class CreateProduct implements CreateProductInterface {

  productsRepository: ProductsRepositoryInterface;
  categoriesRepository: CategoriesRepositoryInterface;
  companyUserRepository: CompanyUserRepositoryInterface;
  
  constructor(
    productsRepository: ProductsRepositoryInterface,
    categoriesRepository: CategoriesRepositoryInterface,
    companyUserRepository: CompanyUserRepositoryInterface
  ) {
    this.productsRepository = productsRepository;
    this.categoriesRepository = categoriesRepository;
    this.companyUserRepository = companyUserRepository;
  }

  private async validate_category(product: Product) {
    const isAValidCategory = await this.categoriesRepository.getCategoryById(product.categoryId, product.companyId);
    if (!isAValidCategory) {
      throw new Error('Category not valid');
    } 
  }

  private async validate_user_role(product: Product) {
    const { role } = await this.companyUserRepository.getUserCompanyRole(product.userId, product.categoryId);
    if (role === 'VIEW') {
      throw new Error('You do not have permission to write in this company');
    }
  }

  async execute(product: Product) {
    try{
      await this.validate_user_role(product);
      await this.validate_category(product);
      await this.productsRepository.insertNewProduct(product);
    } catch(error) {
      throw new UseCaseError(`Not able to register your product due to: ${error.message}`);
    }
    return null;
  }
}