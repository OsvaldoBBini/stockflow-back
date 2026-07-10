import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { DatabaseError } from '../../../../errors/errorManager';
import { CompanyRepositoryInterface } from '../../../domain/entities/company/companyRepository';
import { CompanyDomainInterface, CompanyInterface, CompanyPersistenceInterface } from '../../../domain/entities/company/company';
import crypto from 'crypto';

export class CompanyRepository implements CompanyRepositoryInterface {

  private dbGateway: DatabaseGatewayInterface;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbGateway = dbGateway;
  }

  private mapCompanyData(persistenceData: CompanyPersistenceInterface): CompanyDomainInterface {
    return {
      companyId: persistenceData.companyId,
      userId: persistenceData.userId,
      companyName: persistenceData.companyName,
      role: persistenceData.role
    };
  }

  private async getCompaniesByUserId(userId: string): Promise<CompanyPersistenceInterface[] | undefined> {
    const { dbClient, queryCommand } = this.dbGateway;
    const command = queryCommand({
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
    });
    const { Items: dbResponse } = await dbClient.send(command);
    const response = dbResponse as CompanyPersistenceInterface[] | undefined;
    return response;
  }

  private async putCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    const { dbClient, putCommand } = this.dbGateway;
    const companyId = crypto.randomUUID();
    const command = putCommand({
      PK: `USER#${companyData.userId}`,
      SK: `COMPANY#${companyId}`,
      ...companyData,
      companyId: companyId
    });
    await dbClient.send(command);
    return {...companyData, companyId};
  }

  async getCompanies(userId: string): Promise<CompanyDomainInterface[] | undefined> {
    try {
      const response = await this.getCompaniesByUserId(userId);
      const companies = response?.map(this.mapCompanyData);
      return companies;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async createCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    try {
      const company = await this.putCompany(companyData);
      return company;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const companyRepository = new CompanyRepository(dynamoGateway);