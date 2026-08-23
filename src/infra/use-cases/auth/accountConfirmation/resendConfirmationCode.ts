import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';
import { authGateway } from '../../../adapters/auth';

const resendConfirmationCodeSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
});

const logger = new Logger({ serviceName: 'resendConfirmationCode' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    logger.info('Resend confirmation code process started');
    const { 
      email
    } = resendConfirmationCodeSchema.parse(JSON.parse(event.body || ''));

    logger.info({ message: 'Input validation successful', email });
    await authGateway.resendConfirmationCode(email);

    logger.info({ message: 'Confirmation code resent successfully', email });
    return {
      statusCode: 200,
      body: JSON.stringify({ data: { message: 'Confirmation code sent to email' } })
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}
