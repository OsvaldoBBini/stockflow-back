import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';
import { ErrorManager } from '../../../../errors/errorManager';

const signInSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  password: z.string({message: 'Invalid password'}).min(8, {message: 'Password must be at least 8 characters long.'}).max(20, {message: 'Password must be at most 20 characters long.'}),
});

const logger = new Logger({ serviceName: 'signIn' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    logger.info('Sign in process started');
    
    const cognitoClient = new CognitoIdentityProviderClient();
    const { email, password } = signInSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email });

    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      }
    });

    logger.debug({ message: 'Sending InitiateAuth command to Cognito', email });
    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult) {
      logger.warn({ message: 'Authentication failed: No authentication result returned', email });
      return {
        statusCode: 401,
        body: JSON.stringify({ data: { message: 'Invalid Credentials.' } })
      };
    }

    logger.info({ message: 'User authenticated successfully', email });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          accessToken: AuthenticationResult.AccessToken,
          refreshToken: AuthenticationResult.RefreshToken
        }
      })
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}