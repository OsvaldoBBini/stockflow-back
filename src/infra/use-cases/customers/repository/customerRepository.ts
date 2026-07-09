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
      phoneNumber: persistenceData.phoneNumber
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

  private async getCustomerByCpf(companyId: string, cpf: string): Promise<CustomerPersistenceInterface | undefined> {
    const { dbClient, getCommand } = this.dbGateway;
    const command = getCommand({
      Key: {
        PK: `COMPANY#${companyId}#CUSTOMERS`,
        SK: `CUSTOMER#${cpf}`
      }
    });

    const { Item: dbResponse } = await dbClient.send(command);
    const response = dbResponse as CustomerPersistenceInterface | undefined;
    return response;
  }

  private async putCustomer(customerData: CustomerInterface): Promise<void> {
    const { dbClient, putCommand } = this.dbGateway;
    const command = putCommand({
      PK: `COMPANY#${customerData.companyId}#CUSTOMERS`,
      SK: `CUSTOMER#${customerData.cpf}`,
      ...customerData
    });
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

  async getCustomer(companyId: string, cpf: string): Promise<CustomerDomainInterface | undefined> {
    try {
      const response = await this.getCustomerByCpf(companyId, cpf);
      const customerData: CustomerDomainInterface | undefined = response ? this.mapCustomerData(response) : undefined;
  
      return customerData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async storeCustomer(customerData: CustomerInterface): Promise<void> {
    try {
      await this.putCustomer(customerData);
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const customerRepository = new CustomerRepository(dynamoGateway);