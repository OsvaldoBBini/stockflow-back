import { Logger } from '@aws-lambda-powertools/logger';
import { CodeMismatchException, CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';

const accountConfirmationSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  confirmationCode: z.string({message: 'Invalid confirmation code'}),
});

const logger = new Logger({ serviceName: 'accountConfirmation' });

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    const cognitoClient = new CognitoIdentityProviderClient();

    const { 
      email, 
      confirmationCode
    } = accountConfirmationSchema.parse(JSON.parse(event.body || ''));

    logger.debug(JSON.stringify({inputs: { email }}));

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode
    });

    await cognitoClient.send(command);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ user: { email } })
    };

  } catch (e) {
    const errorManager = new ErrorManager(logger);

    if (e instanceof CodeMismatchException) {
      errorManager.dispatchLoggerMessage(e);
      return {
        statusCode: 404,
        body: JSON.stringify({'message': 'The confirmation code is not valid'})
      };
    }

    const errorResponse = errorManager.errorHandler(e);
    return errorResponse;
  }
}