
import { Logger } from '@aws-lambda-powertools/logger';
import { CognitoIdentityProviderClient, ForgotPasswordCommand, UserNotFoundException } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';

const changePasswordConfirmationCodeSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
});

const logger = new Logger({ serviceName: 'changePasswordConfirmationCode' });

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    const cognitoClient = new CognitoIdentityProviderClient();
    const { 
      email, 
    } = changePasswordConfirmationCodeSchema.parse(JSON.parse(event.body || ''));

    logger.debug(JSON.stringify({inputs: { email }}));

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);
    
    return {
      statusCode: 200,
      body: JSON.stringify({user: { email }})
    };

  } catch (e) {

    const errorManager = new ErrorManager(logger);

    if (e instanceof UserNotFoundException) {
      errorManager.dispatchLoggerMessage(e);
      return {
        statusCode: 404,
        body: JSON.stringify({message: 'User not found'})
      };
    }

    const errorResponse = errorManager.errorHandler(e);
    return errorResponse;
  
  }

}