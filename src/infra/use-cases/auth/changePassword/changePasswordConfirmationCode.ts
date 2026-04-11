
import { Logger } from '@aws-lambda-powertools/logger';
import { CognitoIdentityProviderClient, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    
    const cognitoClient = new CognitoIdentityProviderClient();
    const { 
      email, 
    } = changePasswordConfirmationCodeSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email });

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    });

    logger.debug({ message: 'Sending ForgotPassword command to Cognito', email });
    await cognitoClient.send(command);
    
    logger.info({ message: 'Password reset confirmation code sent successfully', email });
    
    return {
      statusCode: 200,
      body: JSON.stringify({user: { email }})
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}