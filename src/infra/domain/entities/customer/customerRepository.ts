import { CustomerDomainInterface } from '../../../domain/entities/customer/customer';
import { CustomerInterface } from './customer';

export interface CustomerRepositoryInterface {
  getCustomers(companyId: string): Promise<CustomerDomainInterface[] | undefined>;
  updateCustomer(customerData: CustomerDomainInterface): Promise<void>;
  storeCustomer(customerData: CustomerInterface): Promise<string>;
}