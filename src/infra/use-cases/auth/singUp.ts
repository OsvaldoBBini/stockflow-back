import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z, ZodError } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';

const signInSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  password: z.string()
    .min(8, {message: 'Password must be at least 8 characters long.'})
    .max(20, {message: 'Password must be at most 20 characters long.'})
    .regex(
      /(?=.*[A-Z])/, 
      { message: 'Password must contain at least one uppercase letter.' }
    )
    .regex(
      /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
      { message: 'Password must contain at least one special character.' }
    ),
});
const logger = new Logger({ serviceName: 'signUp' });

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    const cognitoClient = new CognitoIdentityProviderClient();
    const { email, password } = signInSchema.parse(JSON.parse(event.body || ''));

    logger.debug(JSON.stringify({inputs: {email, password}}));

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
        body: JSON.stringify({error: 'Invalid Credentials.'})
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
    
    if(e instanceof ZodError) {
      logger.error(JSON.stringify({error: e.stack}));
      return {
        statusCode: 400,
        body: JSON.stringify({message: 'Invalid input data'})
      };
    }
    
    logger.error(JSON.stringify({error: e}));
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Something went wrong'})
    };
  }
  
}