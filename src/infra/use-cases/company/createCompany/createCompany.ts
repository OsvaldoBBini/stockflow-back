import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import z from 'zod';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { companyRepository } from '../repository/companyRepository';

const logger = new Logger({ serviceName: 'createCompany' });
const { errorHandler } = new ErrorManager(logger);

const createCompanySchema = z.object({
  companyName: z.string().min(2, {message: 'Company name must be at least 2 characters long.'}).max(20, {message: 'Company name must be at most 20 characters long.'}),
});

export async function handler(event: APIGatewayProxyEvent) {

  try {
    const userId = event.requestContext.authorizer?.jwt.claims.sub;
    
    const { 
      companyName 
    } = createCompanySchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', companyName });

    const companyId = await companyRepository.createCompany({ userId, companyName, role: 'owner' });
  
    return {
      statusCode: 201,
      body: JSON.stringify(
        { 
          data: { company: { companyId } }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}