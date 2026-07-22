import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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

    it('should store company successfully and define as default', async () => {
  
      const companyData: CompanyInterface = {
        userId: mockUserId,
        companyName: 'Test Company',
        role: 'owner',
        isDefault: true
      };

      dbMock.on(QueryCommand).resolves({
        Items: [{
          PK: `USER#${mockUserId}`,
          SK: 'COMPANY#existing',
          companyId: 'existing',
          userId: mockUserId,
          companyName: 'Existing Company',
          role: 'owner',
          isDefault: true
        }]
      });
    
      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });
    
      await expect(
        repository.createCompany(companyData)
      ).resolves.not.toThrow();
    
      expect(dbMock.commandCalls(PutCommand).length).toBe(2);
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

    it('should return created company with generated companyId', async () => {
      const companyData: CompanyInterface = {
        userId: mockUserId,
        companyName: 'Test Company',
        role: 'owner'
      };

      dbMock.on(PutCommand).resolves({ $metadata: { httpStatusCode: 200 } });

      const created = await repository.createCompany(companyData);

      expect(created).toHaveProperty('companyId');
      expect(created.userId).toBe(mockUserId);
      expect(created.companyName).toBe('Test Company');
      expect(dbMock.commandCalls(PutCommand).length).toBeGreaterThanOrEqual(1);
    });

  });
  
  describe('getCompanies', () => {

    it('should return companies for a user', async () => {
      const mockItems = [
        { 
          PK: `USER#${mockUserId}`, 
          SK: 'COMPANY#c1', 
          companyId: 'c1',
          userId: mockUserId, 
          companyName: 'Test Company', 
          role: 'owner',
          isDefault: true
        },
      ];

      dbMock.on(QueryCommand).resolves({ Items: mockItems });

      const result = await repository.getCompanies(mockUserId);

      expect(result).toHaveLength(1);
      expect(result?.[0].companyName).toBe('Test Company');
      expect(dbMock.commandCalls(QueryCommand).length).toBe(1);
    });
    
    it('should return companies for a user', async () => {
      const mockItems = [
        { 
          PK: `USER#${mockUserId}`, 
          SK: 'COMPANY#c1', 
          companyId: 'c1',
          userId: mockUserId, 
          companyName: 'Test Company', 
          role: 'owner',
          isDefault: false
        },
      ];

      dbMock.on(QueryCommand).resolves({ Items: mockItems });

      const result = await repository.getCompanies(mockUserId);

      expect(result).toHaveLength(1);
      expect(result?.[0].companyName).toBe('Test Company');
      expect(dbMock.commandCalls(QueryCommand).length).toBe(1);
    });

    it('should handle database errors when querying', async () => {
      dbMock.on(QueryCommand).rejects(new Error('Query error'));

      await expect(repository.getCompanies(mockUserId)).rejects.toThrow('Query error');
    });

  });
  
});