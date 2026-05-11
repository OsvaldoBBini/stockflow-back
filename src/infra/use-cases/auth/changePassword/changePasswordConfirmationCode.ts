import { Logger } from '@aws-lambda-powertools/logger';
import { authGateway } from '../../../adapters/auth';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';

const changePasswordConfirmationCodeSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
});

const logger = new Logger({ serviceName: 'changePasswordConfirmationCode' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    logger.info('Change password confirmation code process started');
    const { email } = changePasswordConfirmationCodeSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email });
    await authGateway.changePasswordConfirmationCode(email);
    
    logger.info({ message: 'Password reset confirmation code sent successfully', email });
    return {
      statusCode: 200,
      body: JSON.stringify({ data: { user: { email } } })
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}