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
      role: persistenceData.role,
      isDefault: persistenceData.isDefault
    };
  }

  private async getCompaniesByUserId(userId: string): Promise<CompanyPersistenceInterface[] | null> {
    const { dbClient, queryCommand } = this.dbGateway;
    const command = queryCommand({
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
    });
    const response = await dbClient.send(command);
    const dbResponse = response?.Items as CompanyPersistenceInterface[] | undefined;
    return dbResponse ?? null;
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

  async getCompanies(userId: string): Promise<CompanyDomainInterface[] | null> {
    try {
      const response = await this.getCompaniesByUserId(userId);
      if (!response) return null;
      const companies = response.map(item => this.mapCompanyData(item));
      return companies;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async createCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    try {
      if (companyData.isDefault === true) {
        const companies = await this.getCompanies(companyData.userId);
        if (companies) {
          const isDefaultCompany = companies.filter((company) => company.isDefault === true);
          await this.putCompany({...isDefaultCompany[0], isDefault: false});
        }
      }
      const company = await this.putCompany(companyData);
      return company;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const companyRepository = new CompanyRepository(dynamoGateway);