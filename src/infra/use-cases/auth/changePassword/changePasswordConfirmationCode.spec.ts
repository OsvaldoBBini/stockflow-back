import { CodeMismatchException, CognitoIdentityProviderClient, ConfirmSignUpCommand, ForgotPasswordCommand, UserNotFoundException } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './changePasswordConfirmationCode';

describe('accountConfirmation', () => {

  const cognitoMock = mockClient(CognitoIdentityProviderClient);
  
  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
    }),
  } as APIGatewayProxyEventV2;
  
  beforeEach(() => {
    cognitoMock.reset();
    vi.resetModules();
  
    process.env = {
      COGNITO_CLIENT_ID: 'test-client-id-123',
    };
  });
  
  afterEach(() => { 
    vi.clearAllMocks();
  });
  
  it('should generate the valid code', async () => {
    
    cognitoMock.on(ForgotPasswordCommand).resolves({});
    const response = await handler(event);

    expect(response.statusCode).toBe(200);

  });

  it('should return a 404 with an error message indicating a not exist user', async () => {

    const mockError = new UserNotFoundException('');
    cognitoMock.on(ForgotPasswordCommand).rejects(mockError);

    const response = await handler(event);
    expect(response.statusCode).toBe(404);    
    expect(JSON.parse(response.body)).toEqual({
      message: 'User not found'
    });
  });

});