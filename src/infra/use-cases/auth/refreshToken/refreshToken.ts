import { authGateway } from '../../../adapters/auth';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';
import { ErrorManager } from '../../../../errors/errorManager';

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, {message: 'Refresh token is required.'})
});
const logger = new Logger({ serviceName: 'refreshToken' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    logger.info('Refresh token process started');
    const { refreshToken } = refreshTokenSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', refreshToken });
    const authResult = await authGateway.refreshToken(refreshToken);

    if (!authResult) {
      return {
        statusCode: 401,
        body: JSON.stringify({ data: { message: 'Invalid refresh token.' } })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken
        }
      })
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}