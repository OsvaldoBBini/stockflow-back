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

  private async setCompanyAsDefault(companyId: string, userId: string): Promise<{companyId: string}> {
    const { dbClient, putCommand } = this.dbGateway;
    const command = putCommand({
      PK: `USER#${userId}`,
      SK: 'DEFAULT#COMPANY',
      companyId: companyId
    });
    await dbClient.send(command);
    return { companyId };
  }

  async getCompanies(userId: string): Promise<CompanyDomainInterface[] | undefined> {
    try {
      const response = await this.getCompaniesByUserId(userId);
      const defaultCompanyReturn = response?.filter((item) => item.SK === 'DEFAULT#COMPANY');
      const defaultCompany = defaultCompanyReturn?.[0]?.companyId ?? null; 

      const companies = response?.filter(
        (item) => item.SK.startsWith('COMPANY'))?.map(
        (item) => {
          const domainItem = this.mapCompanyData(item);
          if (domainItem.companyId === defaultCompany) {
            return {...domainItem, isDefault: true};
          }
          return domainItem;
        });

      return companies;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async createCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    try {
      const company = await this.putCompany(companyData);
      if (company.isDefault) await this.setCompanyAsDefault(company.companyId, company.userId);
      return company;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async setDefaultCompany(companyId: string, userId: string): Promise<{companyId: string}> {
    try {
      const response = await this.setCompanyAsDefault(companyId, userId);
      return response;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const companyRepository = new CompanyRepository(dynamoGateway);