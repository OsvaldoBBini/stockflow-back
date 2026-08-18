import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CustomerRepository } from './customerRepository';
import { CustomerInterface } from '../../../domain/entities/customer/customer';
import { DatabaseError } from '../../../../errors/errorManager';
import { dynamoGateway } from '../../../adapters/database/dynamo';

const dbMock = mockClient(DynamoDBDocumentClient);

describe('CustomerRepository', () => {

  let repository: CustomerRepository;

  beforeEach(() => {
    dbMock.reset();
    repository = new CustomerRepository(dynamoGateway);
  });

  describe('storeCustomer', () => {

    it('should store customer successfully', async () => {

      const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
      const customerData: CustomerInterface = {
        companyId: companyId,
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await expect(
        repository.storeCustomer(customerData)
      ).resolves.not.toThrow();

      expect(dbMock.commandCalls(PutCommand).length).toBe(1);
    });

    it('should call PutCommand with correct parameters', async () => {

      const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
      const customerData: CustomerInterface = {
        companyId: companyId,
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await repository.storeCustomer(customerData);

      const putCommand = dbMock.commandCalls(PutCommand)[0];
      expect(putCommand.args[0].input.Item).toEqual(
        expect.objectContaining({
          PK: `COMPANY#${customerData.companyId}#CUSTOMERS`,
          ...customerData,
          customerId: expect.any(String)
        })
      );
    });

    it('should store customer with optional email field', async () => {

      const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
      const customerData: CustomerInterface = {
        companyId: companyId,
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await repository.storeCustomer(customerData);

      const putCommand = dbMock.commandCalls(PutCommand)[0];
      expect(putCommand.args[0].input.Item).toEqual(
        expect.objectContaining({
          PK: `COMPANY#${customerData.companyId}#CUSTOMERS`,
          ...customerData,
          customerId: expect.any(String)
        })
      );
    });

    it('should handle database errors when storing', async () => {

      const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
      const customerData: CustomerInterface = {
        companyId: companyId,
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
      };

      dbMock.on(PutCommand).rejects(new Error('Database error'));

      await expect(
        repository.storeCustomer(customerData)
      ).rejects.toThrow('Database error');
    });

  });

  describe('updateCustomer', () => {

    it('should update customer successfully', async () => {

      const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
      const customerId = 'customer-12345';

      const customerData: CustomerInterface = {
        companyId: companyId,
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(UpdateCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await expect(
        repository.updateCustomer({ ...customerData, customerId })
      ).resolves.not.toThrow();

      expect(dbMock.commandCalls(UpdateCommand).length).toBe(1);
    });
    
  });

  describe('Error Handling', () => {

    it('should throw DatabaseError on storeCustomer when DB fails', async () => {

      const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
      const customerData: CustomerInterface = {
        companyId: companyId,
        email: 'john@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      };

      dbMock.on(PutCommand).rejects(new Error('Table not found'));

      await expect(
        repository.storeCustomer(customerData)
      ).rejects.toThrow(DatabaseError);
    });
  });
});
