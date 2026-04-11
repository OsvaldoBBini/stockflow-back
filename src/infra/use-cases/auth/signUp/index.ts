import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';
import { ErrorManager } from '../../../../errors/errorManager';

const signUpSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  password: z.string()
    .min(8, {message: 'Password must be at least 8 characters long.'})
    .max(20, {message: 'Password must be at most 20 characters long.'})
    .regex(
      /(?=.*[A-Z])/, 
      { message: 'Password must contain at least one uppercase letter.' }
    )
    .regex(
      /(?=.*[0-9])/,
      { message: 'Password must contain at least one number.' }
    )
    .regex(
      /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 
      { message: 'Password must contain at least one special character.' }
    ),
  firstName: z.string(),
  lastName: z.string()
});

const logger = new Logger({ serviceName: 'signUp' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    logger.info('Sign up process started');
    
    const cognitoClient = new CognitoIdentityProviderClient();

    const { 
      email, 
      password, 
      firstName, 
      lastName } = signUpSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email, firstName, lastName });

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'given_name',
          Value: firstName
        },
        {
          Name: 'family_name',
          Value: lastName
        }]
    });

    logger.debug({ message: 'Sending SignUp command to Cognito', email });
    const { UserSub } = await cognitoClient.send(command);

    logger.info({ message: 'User registered successfully', userId: UserSub, email });
    
    return {
      statusCode: 201,
      body: JSON.stringify({user: {id: UserSub}}),
    };

  } catch (e) {    
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
  
}