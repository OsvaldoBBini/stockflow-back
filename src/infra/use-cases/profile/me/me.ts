import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ErrorManager } from '../../../../errors/errorManager';
import { authGateway } from '../../../adapters/auth';

const logger = new Logger({ serviceName: 'getProfile' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEvent) {
  try {
    logger.debug({ message: 'Get request context', requestContext: event.requestContext });
    const userId = event.requestContext.authorizer?.jwt.claims.sub;

    const attributes = await authGateway.getUserInfos(userId);
    logger.debug({ message: 'Get attributes', attributes });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ data: attributes }),
    };

  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }
}