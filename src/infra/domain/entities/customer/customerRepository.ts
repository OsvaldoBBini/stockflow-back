import { CustomerDomainInterface } from '../../../domain/entities/customer/customer';
import { CustomerInterface } from './customer';

export interface CustomerRepositoryInterface {
  getCustomers(userId: string): Promise<CustomerDomainInterface[] | undefined>;
  getCustomer(userId: string, cpf: string): Promise<CustomerDomainInterface | undefined>;
  storeCustomer(userId: string, customerData: CustomerInterface): Promise<void>;
}