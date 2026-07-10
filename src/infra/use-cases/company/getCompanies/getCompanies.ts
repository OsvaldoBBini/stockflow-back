import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { companyRepository } from '../repository/companyRepository';

const logger = new Logger({ serviceName: 'getCompanies' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEvent) {

  try {
    const userId = event.requestContext.authorizer?.jwt.claims.sub;

    logger.debug({ message: 'Fetching companies for user', userId });

    const companies = await companyRepository.getCompanies(userId);

    return {
      statusCode: 200,
      body: JSON.stringify(
        { 
          data: {
            items: companies || []
          }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}