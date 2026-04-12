import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ErrorManager } from '../../../../errors/errorManager';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const logger = new Logger({ serviceName: 'getProfile' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {

  try {

    const cognitoClient = new CognitoIdentityProviderClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (event.requestContext as any).authorizer.jwt.claims.sub;

    logger.debug({ message: 'Get request context', requestContext: event.requestContext });
    
    const command = new AdminGetUserCommand({
      Username: userId,
      UserPoolId: process.env.COGNITO_POOL_ID
    });
    
    const { UserAttributes } = await cognitoClient.send(command);
    
    const attributes = UserAttributes && UserAttributes.reduce((acc, post) => {
      const { Name, Value } = post;
      if (!Name || !Value) return acc;
      return {...acc, [Name]: Value};
    }, {});

    logger.debug({ message: 'Get attributes', attributes });
    
    return {
      statusCode: 200,
      body: JSON.stringify(attributes),
    };

  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }
}