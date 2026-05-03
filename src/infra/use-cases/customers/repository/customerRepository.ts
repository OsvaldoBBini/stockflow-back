import { DynamoDBDocumentClient, GetCommand,QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { CustomerDomainInterface, CustomerInterface, CustomerPersistenceInterface } from '../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../domain/entities/customer/customerRepository';
import { DatabaseError } from '../../../../errors/errorManager';

export class CustomerRepository implements CustomerRepositoryInterface {

  private dbClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbClient = dbGateway.dbClient;
    this.tableName = dbGateway.tableName;
  }

  async getCustomers(userId: string): Promise<CustomerDomainInterface[] | undefined> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}#CUSTOMERS`
        }
      });
  
      const { Items: response } = await this.dbClient.send(command);
  
      const customersData: CustomerDomainInterface[] | undefined = response ? (response as CustomerPersistenceInterface[]).map(
        (item) => ({ 
          userId: item.PK.split('#')[1], 
          email: item.email, 
          fullName: item.fullName,
          cpf: item.cpf, 
          phoneNumber: item.phoneNumber
        })
      ) : undefined;
  
      return customersData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async getCustomer(userId: string, cpf: string): Promise<CustomerDomainInterface | undefined> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}#CUSTOMERS`,
          SK: `CUSTOMER#${cpf}`
        }
      });
  
      const { Item: response } = await this.dbClient.send(command);
  
      const customerData: CustomerDomainInterface | undefined = response ? { 
        userId: (response as CustomerPersistenceInterface).PK.split('#')[1], 
        email: (response as CustomerPersistenceInterface).email, 
        fullName: (response as CustomerPersistenceInterface).fullName,
        cpf: (response as CustomerPersistenceInterface).cpf, 
        phoneNumber: (response as CustomerPersistenceInterface).phoneNumber 
      } : undefined;
  
      return customerData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async storeCustomer(userId: string, customerData: CustomerInterface): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${userId}#CUSTOMERS`,
          SK: `CUSTOMER#${customerData.cpf}`,
          ...customerData
        }
      });
      await this.dbClient.send(command);
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const customerRepository = new CustomerRepository(dynamoGateway);