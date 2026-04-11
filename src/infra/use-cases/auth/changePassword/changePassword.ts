import { ConfirmForgotPasswordCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import z from 'zod';
import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

const changePasswordSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  confirmationCode: z.string(),
  newPassword: z.string()
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
});

const logger = new Logger({ serviceName: 'changePassword' });
const { errorHandler } = new ErrorManager(logger);


export async function handler(event: APIGatewayProxyEventV2) {

  try {
    logger.info('Change password process started');
    
    const cognitoClient = new CognitoIdentityProviderClient();
    const { email, confirmationCode, newPassword } = changePasswordSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email });

    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword
    });

    logger.debug({ message: 'Sending ConfirmForgotPassword command to Cognito', email });
    await cognitoClient.send(command);
    
    logger.info({ message: 'Password changed successfully', email });
    
    return {
      statusCode: 201,
      body: JSON.stringify({user: { email }})
    };

  } catch (e) {
    const errorResponse = errorHandler(e);
    return errorResponse;
  }
}