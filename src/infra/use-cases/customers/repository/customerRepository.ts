import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { CustomerDomainInterface, CustomerInterface } from '../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../domain/entities/customer/customerRepository';

class CustomerRepository implements CustomerRepositoryInterface {

  private dbClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbClient = dbGateway.dbClient;
    this.tableName = dbGateway.tableName;
  }

  async getCustomer(userId: string, cpf: string): Promise<CustomerDomainInterface | undefined> {
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
  }

  async storeCustomer(userId: string, customerData: CustomerInterface): Promise<void> {
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
  }
}

export const customerRepository = new CustomerRepository(dynamoGateway);