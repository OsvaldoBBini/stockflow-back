import { UUID } from 'node:crypto';
import { Category } from '../categories/category';

export interface CategoriesRepositoryInterface {
  getCategoryById(id: UUID): Promise<Category | null> 
}