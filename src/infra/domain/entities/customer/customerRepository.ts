import { CustomerDomainInterface } from '../../../domain/entities/customer/customer';
import { CustomerInterface } from './customer';

export interface CustomerRepositoryInterface {
  getCustomers(companyId: string): Promise<CustomerDomainInterface[] | undefined>;
  getCustomer(companyId: string, cpf: string): Promise<CustomerDomainInterface | undefined>;
  storeCustomer(customerData: CustomerInterface): Promise<void>;
}