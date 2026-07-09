import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { DatabaseError } from '../../../../errors/errorManager';
import { CompanyRepositoryInterface } from '../../../domain/entities/company/companyRepository';
import { CompanyInterface } from '../../../domain/entities/company/company';
import crypto from 'crypto';

export class CompanyRepository implements CompanyRepositoryInterface {

  private dbGateway: DatabaseGatewayInterface;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbGateway = dbGateway;
  }

  private async putCompany(companyData: CompanyInterface): Promise<void> {
    const { dbClient, putCommand } = this.dbGateway;
    const companyId = crypto.randomUUID();
    const command = putCommand({
      PK: `USER#${companyData.userId}`,
      SK: `COMPANY#${companyId}`,
      ...companyData,
      companyId: companyId
    });
    await dbClient.send(command);
  }

  async createCompany(companyData: CompanyInterface): Promise<void> {
    try {
      await this.putCompany(companyData);
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const companyRepository = new CompanyRepository(dynamoGateway);