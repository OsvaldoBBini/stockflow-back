import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
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
    
    const cognitoClient = new CognitoIdentityProviderClient();
    const { refreshToken } = refreshTokenSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', refreshToken });

    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    });

    logger.debug({ message: 'Sending InitiateAuth command to Cognito', refreshToken });
    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult) {
      logger.warn({ message: 'Refresh token is invalid or has expired', refreshToken });
      return {
        statusCode: 401,
        body: JSON.stringify({message: 'Invalid refresh token.'})
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
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}