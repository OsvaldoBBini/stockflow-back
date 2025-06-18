import { expect, test } from 'vitest';
import { Category } from '../../../domain/categories/category';
import { CreateProduct } from './create-product';
import { ProductsRepositoryInterface } from '../../../domain/repositories/productsRepository';
import { Product } from '../../../domain/products/product';
import { CategoriesRepositoryInterface } from '../../../domain/repositories/categoriesRepository';
import { UUID } from 'crypto';
import { successMockProduct } from '../../../tests/configs';
import { UseCaseError } from '../../../errors/errors';
import { CompanyUserRepositoryInterface } from '../../../domain/repositories/companyUserRepository';
import { CompanyUser } from '../../../domain/companyUser/companyUser';

class ViewCompanyUserRepository implements CompanyUserRepositoryInterface {
  async getUserCompanyRole(userId: UUID, companyId: UUID): Promise<CompanyUser> {
    return new CompanyUser({userId: userId, role: 'VIEW', companyId: companyId});
  }
}

class WriteCompanyUserRepository implements CompanyUserRepositoryInterface {
  async getUserCompanyRole(userId: UUID, companyId: UUID): Promise<CompanyUser> {
    return new CompanyUser({userId: userId, role: 'WRITE', companyId: companyId});
  }
}

class ProductsRepository implements ProductsRepositoryInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async insertNewProduct(product: Product): Promise<null> {
    return null;
  }
}

class ErrorProductsRepository implements ProductsRepositoryInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async insertNewProduct(product: Product): Promise<null> {
    throw new Error('test product repository');
  }
}

class CategoriesRepository implements CategoriesRepositoryInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCategoryById(id: UUID, companyId: UUID): Promise<Category | null> {
    return {} as Category;
  }
}

class ErrorCategoriesRepository implements CategoriesRepositoryInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCategoryById(id: UUID, companyId: UUID): Promise<Category | null> {
    return null;
  }
}

test('should create a new product', async () => {
  const productsRepository = new ProductsRepository();
  const categoriesRepository = new CategoriesRepository();
  const companyUserRepository = new WriteCompanyUserRepository();
  const product = new Product(successMockProduct);
  const response = await new CreateProduct(productsRepository, categoriesRepository, companyUserRepository).execute(product);
  expect(response).equal(null);
});

test('should not create a new product because something went wrong in production repository', async () => {
  const productsRepository = new ErrorProductsRepository();
  const categoriesRepository = new CategoriesRepository();
  const companyUserRepository = new WriteCompanyUserRepository();
  const product = new Product(successMockProduct);
  try {
    await new CreateProduct(productsRepository, categoriesRepository, companyUserRepository).execute(product);
  } catch (error) {
    expect(error).toBeInstanceOf(UseCaseError);
    expect(error.message).equal('Not able to register your product due to: test product repository');
  }
});

test('should not create a new product because not valid category', async () => {
  const productsRepository = new ProductsRepository();
  const categoriesRepository = new ErrorCategoriesRepository();
  const companyUserRepository = new WriteCompanyUserRepository();
  const product = new Product(successMockProduct);
  try {
    await new CreateProduct(productsRepository, categoriesRepository, companyUserRepository).execute(product);
  } catch (error) {
    expect(error).toBeInstanceOf(UseCaseError);
    expect(error.message).equal('Not able to register your product due to: Category not valid');
  }
});

test('should not create a new product because user do not have permission', async () => {
  const productsRepository = new ProductsRepository();
  const categoriesRepository = new ErrorCategoriesRepository();
  const companyUserRepository = new ViewCompanyUserRepository();
  const product = new Product(successMockProduct);
  try {
    await new CreateProduct(productsRepository, categoriesRepository, companyUserRepository).execute(product);
  } catch (error) {
    expect(error).toBeInstanceOf(UseCaseError);
    expect(error.message).equal('Not able to register your product due to: You do not have permission to write in this company');
  }
});