import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { CustomerRepository } from './customerRepository';
import { CustomerDomainInterface, CustomerInterface } from '../../../domain/entities/customer/customer';
import { dynamoGateway } from '../../../adapters/database/dynamo';

const dbMock = mockClient(DynamoDBDocumentClient);
const tableName: string = 'FormsBuilderTable';


describe('CustomerRepository', () => {

  let repository: CustomerRepository;

  beforeEach(() => {
    dbMock.reset();
    repository = new CustomerRepository(dynamoGateway);
  });

  describe('getCustomer', () => {

    it('should return customer when it exists', async () => {

      const mockUserId = 'user123';
      const mockCpf = '12345678901';

      const customerData: CustomerDomainInterface = {
        userId: mockUserId,
        email: 'john@example.com',
        cpf: mockCpf,
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(GetCommand).resolves({
        Item: {
          PK: `USER#${mockUserId}#CUSTOMERS`,
          SK: `CUSTOMER#${mockCpf}`,
          ...customerData
        },
        $metadata: { httpStatusCode: 200 }
      });

      const result = await repository.getCustomer(mockUserId, mockCpf);

      expect(result).toBeDefined();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.cpf).toBe(mockCpf);
      expect(result?.email).toBe('john@example.com');
      expect(result?.fullName).toBe('John Doe');
    });

    it('should return undefined when customer does not exist', async () => {

      const mockUserId = 'user123';
      const mockCpf = '12345678901';

      dbMock.on(GetCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      const result = await repository.getCustomer(mockUserId, mockCpf);

      expect(result).toBeUndefined();
    });

    it('should call GetCommand with correct parameters', async () => {

      const mockUserId = 'user123';
      const mockCpf = '12345678901';

      dbMock.on(GetCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await repository.getCustomer(mockUserId, mockCpf);

      expect(dbMock.commandCalls(GetCommand)[0].args[0].input).toEqual({
        TableName: tableName,
        Key: {
          PK: `USER#${mockUserId}#CUSTOMERS`,
          SK: `CUSTOMER#${mockCpf}`
        }
      });
    });
  });

  describe('storeCustomer', () => {

    it('should store customer successfully', async () => {

      const mockUserId = 'user123';
      const customerData: CustomerInterface = {
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await expect(
        repository.storeCustomer(mockUserId, customerData)
      ).resolves.not.toThrow();

      expect(dbMock.commandCalls(PutCommand).length).toBe(1);
    });

    it('should call PutCommand with correct parameters', async () => {

      const mockUserId = 'user123';
      const customerData: CustomerInterface = {
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await repository.storeCustomer(mockUserId, customerData);

      const putCommand = dbMock.commandCalls(PutCommand)[0];
      expect(putCommand.args[0].input).toEqual({
        TableName: tableName,
        Item: {
          PK: `USER#${mockUserId}#CUSTOMERS`,
          SK: `CUSTOMER#${customerData.cpf}`,
          ...customerData
        }
      });
    });

    it('should store customer with optional email field', async () => {

      const mockUserId = 'user123';
      const customerData: CustomerInterface = {
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await repository.storeCustomer(mockUserId, customerData);

      const putCommand = dbMock.commandCalls(PutCommand)[0];
      expect(putCommand.args[0].input.Item).toEqual({
        PK: `USER#${mockUserId}#CUSTOMERS`,
        SK: `CUSTOMER#${customerData.cpf}`,
        ...customerData
      });
    });

    it('should handle database errors when storing', async () => {

      const mockUserId = 'user123';
      const customerData: CustomerInterface = {
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).rejects(new Error('Database error'));

      await expect(
        repository.storeCustomer(mockUserId, customerData)
      ).rejects.toThrow('Database error');
    });
  });
});
