import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { CustomerDomainInterface, CustomerInterface, CustomerPersistenceInterface } from '../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../domain/entities/customer/customerRepository';
import { DatabaseError } from '../../../../errors/errorManager';

export class CustomerRepository implements CustomerRepositoryInterface {

  private dbGateway: DatabaseGatewayInterface;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbGateway = dbGateway;
  }

  private mapCustomerData(persistenceData: CustomerPersistenceInterface): CustomerDomainInterface {
    return {
      companyId: persistenceData.companyId,
      email: persistenceData.email, 
      fullName: persistenceData.fullName,
      cpf: persistenceData.cpf, 
      phoneNumber: persistenceData.phoneNumber,
      customerId: persistenceData.customerId
    };
  }

  private async queryCustomersByCompanyId(companyId: string): Promise<CustomerPersistenceInterface[] | undefined> {
    const { dbClient, queryCommand } = this.dbGateway;
    const command = queryCommand({
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `COMPANY#${companyId}#CUSTOMERS` }
    });
  
    const { Items: dbResponse } = await dbClient.send(command);
    const response = dbResponse as CustomerPersistenceInterface[] | undefined;
    return response;
  } 

  private async putCustomer(customerData: CustomerInterface): Promise<string> {
    const { dbClient, putCommand } = this.dbGateway;

    const customerId = crypto.randomUUID(); 

    const command = putCommand({
      PK: `COMPANY#${customerData.companyId}#CUSTOMERS`,
      SK: `CUSTOMER#${customerId}`,
      ...customerData,
      customerId: customerId
    });
    await dbClient.send(command);
    return customerId;
  }

  private async changeCustomer(customerData: CustomerDomainInterface): Promise<void> {
    const { dbClient, updateCommand } = this.dbGateway;

    let updateValues: { email?: string; fullName: string; cpf: string; phoneNumber: string } = {
      fullName: customerData.fullName,
      cpf: customerData.cpf,
      phoneNumber: customerData.phoneNumber
    };

    if (customerData.email !== undefined) updateValues = { ...updateValues, email: customerData.email};

    const command = updateCommand({
      PK: `COMPANY#${customerData.companyId}#CUSTOMERS`,
      SK: `CUSTOMER#${customerData.customerId}`
    }, updateValues);
    await dbClient.send(command);
  }
  
  async getCustomers(companyId: string): Promise<CustomerDomainInterface[] | undefined> {
    try {
      const response = await this.queryCustomersByCompanyId(companyId);  
      const customersData: CustomerDomainInterface[] | undefined = response ? response.map((item) => this.mapCustomerData(item)) : undefined;

      return customersData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
  
  async storeCustomer(customerData: CustomerInterface): Promise<string> {
    try {
      const customerId = await this.putCustomer(customerData);
      return customerId;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async updateCustomer(customerData: CustomerDomainInterface): Promise<void> {
    try {
      await this.changeCustomer(customerData);
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const customerRepository = new CustomerRepository(dynamoGateway);