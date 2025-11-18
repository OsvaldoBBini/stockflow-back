import { CognitoIdentityProviderClient, SignUpCommand, UsernameExistsException } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';
import { ErrorManager } from '../../../errors/errorManager';

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
      /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
      { message: 'Password must contain at least one special character.' }
    ),
  firstName: z.string(),
  lastName: z.string()
});
const logger = new Logger({ serviceName: 'signUp' });

export async function handler(event: APIGatewayProxyEventV2) {

  try {
    const cognitoClient = new CognitoIdentityProviderClient();

    const { 
      email, 
      password, 
      firstName, 
      lastName } = signUpSchema.parse(JSON.parse(event.body || ''));

    logger.debug(JSON.stringify({inputs: {email, password, firstName, lastName}}));

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

    const { UserSub } = await cognitoClient.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({user: {id: UserSub}}),
    };

  } catch (e) {

    if (e instanceof UsernameExistsException) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'E-mail already in used' })
      };
    }
    
    const errorResponse = new ErrorManager(logger).errorHandler(e);
    return errorResponse;
  }
  
}