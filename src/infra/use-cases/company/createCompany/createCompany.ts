import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import z from 'zod';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { companyRepository } from '../repository/companyRepository';

const logger = new Logger({ serviceName: 'createCompany' });
const { errorHandler } = new ErrorManager(logger);

const createCompanySchema = z.object({
  companyName: z.string().min(2, {message: 'Company name must be at least 2 characters long.'}).max(20, {message: 'Company name must be at most 20 characters long.'}),
  cnpj: z.string().regex(/^\d{14}$/, { message: 'Cnpj must be 14 digits long.' }),
  isDefault: z.boolean().default(false)
});

export async function handler(event: APIGatewayProxyEvent) {

  try {
    const userId = event.requestContext.authorizer?.jwt.claims.sub;
    
    const { companyName, cnpj, isDefault } = createCompanySchema.parse(JSON.parse(event.body || ''));
    logger.debug({ message: 'Input validation successful', companyName });

    const company = await companyRepository.createCompany(
      { userId, cnpj, companyName, isDefault, role: 'owner' }
    );
  
    return {
      statusCode: 201,
      body: JSON.stringify(
        { 
          data: { company }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}