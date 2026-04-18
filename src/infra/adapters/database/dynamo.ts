import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export interface DatabaseGatewayInterface {
  dbClient: DynamoDBDocumentClient;
  tableName: string;
}

export class DynamoGateway implements DatabaseGatewayInterface {
  public dbClient: DynamoDBDocumentClient;
  public tableName: string;

  constructor() {
    const client = new DynamoDBClient({ region: 'us-east-1' });
    this.tableName = 'FormsBuilderTable';
    this.dbClient = DynamoDBDocumentClient.from(client);
  }
  
}

export const dynamoGateway = new DynamoGateway();