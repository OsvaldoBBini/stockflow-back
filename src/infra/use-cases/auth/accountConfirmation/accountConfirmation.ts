import { Logger } from '@aws-lambda-powertools/logger';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';

const accountConfirmationSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  confirmationCode: z.string({message: 'Invalid confirmation code'}),
});

const logger = new Logger({ serviceName: 'accountConfirmation' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    logger.info('Account confirmation process started');
    
    const cognitoClient = new CognitoIdentityProviderClient();

    const { 
      email, 
      confirmationCode
    } = accountConfirmationSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email });

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode
    });

    logger.debug({ message: 'Sending ConfirmSignUp command to Cognito', email });
    await cognitoClient.send(command);
    
    logger.info({ message: 'Account confirmed successfully', email });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ user: { email } })
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}