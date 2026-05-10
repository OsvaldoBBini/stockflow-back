/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export interface DatabaseGatewayInterface {
  dbClient: DynamoDBDocumentClient;
  queryCommand: (item: QueryCommandInputInterface) => QueryCommand;
  getCommand: (item: GetCommandInputInterface) => GetCommand;
  putCommand: (item: Record<string, any> | undefined) => PutCommand;
}

interface GetCommandInputInterface {
  Key: {
    PK: string;
    SK?: string;
  }
}

interface QueryCommandInputInterface {
  KeyConditionExpression: string;
  ExpressionAttributeValues?: Record<string, any> | undefined
}

export class DynamoGateway implements DatabaseGatewayInterface {
  public dbClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({ region: 'us-east-1' });
    this.tableName = 'FormsBuilderTable';
    this.dbClient = DynamoDBDocumentClient.from(client);
  }

  public queryCommand = (item: QueryCommandInputInterface) => new QueryCommand({
    TableName: this.tableName,
    ...item
  });

  public getCommand = (item: GetCommandInputInterface) => new GetCommand({
    TableName: this.tableName,
    ...item
  });

  public putCommand = (item: Record<string, any> | undefined) => new PutCommand({
    TableName: this.tableName,
    Item: { ...item }
  });
}

export const dynamoGateway = new DynamoGateway();