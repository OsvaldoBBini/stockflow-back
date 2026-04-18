import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { CustomerDomainInterface, CustomerInterface } from '../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../domain/entities/customer/customerRepository';
import { DatabaseError } from '../../../../errors/errorManager';

export class CustomerRepository implements CustomerRepositoryInterface {

  private dbClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbClient = dbGateway.dbClient;
    this.tableName = dbGateway.tableName;
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
  
      const customerData: CustomerDomainInterface | undefined = response && { 
        userId: response.PK.split('#')[1], 
        email: response.email, 
        fullName: response.fullName,
        cpf: response.cpf, 
        phoneNumber: response.phoneNumber };
  
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
      return ;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const customerRepository = new CustomerRepository(dynamoGateway);