import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';
import { authGateway } from '../../../adapters/auth';

const accountConfirmationSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  confirmationCode: z.string({message: 'Invalid confirmation code'}).max(6, {message: 'Confirmation code must be at most 6 characters long.'}),
});

const logger = new Logger({ serviceName: 'accountConfirmation' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    logger.info('Account confirmation process started');
    const { 
      email, 
      confirmationCode
    } = accountConfirmationSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email });
    await authGateway.confirmAccount({ email, confirmationCode });

    logger.info({ message: 'Account confirmed successfully', email });
    return {
      statusCode: 200,
      body: JSON.stringify({ data: { user: { email } } })
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}