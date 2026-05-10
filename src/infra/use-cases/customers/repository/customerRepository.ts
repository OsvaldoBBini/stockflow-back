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
      userId: persistenceData.userId, 
      email: persistenceData.email, 
      fullName: persistenceData.fullName,
      cpf: persistenceData.cpf, 
      phoneNumber: persistenceData.phoneNumber
    };
  }

  private async queryCustomersByUserId(userId: string): Promise<CustomerPersistenceInterface[] | undefined> {
    const { dbClient, queryCommand } = this.dbGateway;
    const command = queryCommand({
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `USER#${userId}#CUSTOMERS` }
    });
  
    const { Items: dbResponse } = await dbClient.send(command);
    const response = dbResponse as CustomerPersistenceInterface[] | undefined;
    return response;
  } 

  private async getCustomerByCpf(userId: string, cpf: string): Promise<CustomerPersistenceInterface | undefined> {
    const { dbClient, getCommand } = this.dbGateway;
    const command = getCommand({
      Key: {
        PK: `USER#${userId}#CUSTOMERS`,
        SK: `CUSTOMER#${cpf}`
      }
    });

    const { Item: dbResponse } = await dbClient.send(command);
    const response = dbResponse as CustomerPersistenceInterface | undefined;
    return response;
  }

  private async putCustomer(userId: string, customerData: CustomerInterface): Promise<void> {
    const { dbClient, putCommand } = this.dbGateway;
    const command = putCommand({
      PK: `USER#${userId}#CUSTOMERS`,
      SK: `CUSTOMER#${customerData.cpf}`,
      userId: userId,
      ...customerData
    });
    await dbClient.send(command);
  }

  async getCustomers(userId: string): Promise<CustomerDomainInterface[] | undefined> {
    try {
      const response = await this.queryCustomersByUserId(userId);  
      const customersData: CustomerDomainInterface[] | undefined = response ? response.map((item) => this.mapCustomerData(item)) : undefined;

      return customersData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async getCustomer(userId: string, cpf: string): Promise<CustomerDomainInterface | undefined> {
    try {
      const response = await this.getCustomerByCpf(userId, cpf);
      const customerData: CustomerDomainInterface | undefined = response ? this.mapCustomerData(response) : undefined;
  
      return customerData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async storeCustomer(userId: string, customerData: CustomerInterface): Promise<void> {
    try {
      await this.putCustomer(userId, customerData);
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const customerRepository = new CustomerRepository(dynamoGateway);