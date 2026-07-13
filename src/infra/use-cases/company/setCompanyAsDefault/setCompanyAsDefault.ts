import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import z from 'zod';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { companyRepository } from '../repository/companyRepository';

const logger = new Logger({ serviceName: 'setCompanyAsDefault' });
const { errorHandler } = new ErrorManager(logger);

const setCompanyAsDefaultSchema = z.object({
  companyId: z.uuidv4()
});

export async function handler(event: APIGatewayProxyEvent) {

  try {
    const userId = event.requestContext.authorizer?.jwt.claims.sub;

    const { companyId } = setCompanyAsDefaultSchema.parse(JSON.parse(event.body || ''));
    logger.debug({ message: 'Input validation successful', companyId });

    const company = await companyRepository.setDefaultCompany(companyId, userId);
  
    return {
      statusCode: 201,
      body: JSON.stringify(
        { 
          data: { companyId: company.companyId }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}