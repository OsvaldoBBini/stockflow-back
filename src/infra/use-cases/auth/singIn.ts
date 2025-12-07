import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';
import { ErrorManager } from '../../../errors/errorManager';

const signInSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  password: z.string({message: 'Invalid password'}),
});

const logger = new Logger({ serviceName: 'signIn' });

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const cognitoClient = new CognitoIdentityProviderClient();
    const { email, password } = signInSchema.parse(JSON.parse(event.body || ''));

    logger.debug(JSON.stringify({inputs: { email }}));

    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      }
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult) {
      return {
        statusCode: 401,
        body: JSON.stringify({message: 'Invalid Credentials.'})
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        accessToken: AuthenticationResult.AccessToken,
        refreshToken: AuthenticationResult.RefreshToken
      })
    };

  } catch (e) {
    const errorResponse = new ErrorManager(logger).errorHandler(e);
    return errorResponse;
  }
}