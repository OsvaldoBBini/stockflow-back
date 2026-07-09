import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoGateway } from '../../../adapters/database/dynamo';
import { CompanyRepository } from './companyRepository';
import { CompanyInterface } from '../../../domain/entities/company/company';

const dbMock = mockClient(DynamoDBDocumentClient);

describe('CompanyRepository', () => {

  let repository: CompanyRepository;
  const mockUserId = 'user123';

  beforeEach(() => {
    dbMock.reset();
    repository = new CompanyRepository(dynamoGateway);
  });

  describe('createCompany', () => {

    it('should store company successfully', async () => {
  
      const companyData: CompanyInterface = {
        userId: mockUserId,
        companyName: 'Test Company',
        role: 'owner'
      };
    
      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });
    
      await expect(
        repository.createCompany(companyData)
      ).resolves.not.toThrow();
    
      expect(dbMock.commandCalls(PutCommand).length).toBe(1);
    });

    it('should handle database errors when storing', async () => {
    
      const companyData: CompanyInterface = {
        userId: mockUserId,
        companyName: 'Test Company',
        role: 'owner'
      };

      dbMock.on(PutCommand).rejects(new Error('Database error'));
    
      await expect(
        repository.createCompany(companyData)
      ).rejects.toThrow('Database error');
    });

  });
  
});