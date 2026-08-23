import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import { customerRepository } from '../repository/customerRepository';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

const logger = new Logger({ serviceName: 'getCustomers' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEvent) {

  try {
    const { companyId } = event.pathParameters || {};
    
    if (!companyId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          data: { 
            message: 'Unauthorized: Missing company ID in path parameters.' 
          } 
        }),
      };
    }

    logger.info({ message: 'Fetching customers for company', companyId });

    const customers = await customerRepository.getCustomers(companyId);
  
    return {
      statusCode: 200,
      body: JSON.stringify(
        { 
          data: {
            items: customers || []
          }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}