import { CodeMismatchException, CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './accountConfirmation';

describe('accountConfirmation', () => {

  const cognitoMock = mockClient(CognitoIdentityProviderClient);
  
  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
      confirmationCode: '123456',
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
  
  it('should validate the confirmation code', async () => {
    
    cognitoMock.on(ConfirmSignUpCommand).resolves({});
    const response = await handler(event);

    expect(response.statusCode).toBe(200);

  });

  it('should return a 409 with an error message indicating a invalid confirmation code', async () => {

    const mockError = new CodeMismatchException('');
    cognitoMock.on(ConfirmSignUpCommand).rejects(mockError);

    const response = await handler(event);
    expect(response.statusCode).toBe(404);    
    expect(JSON.parse(response.body)).toEqual({
      message: 'The confirmation code is not valid'
    });
  });

});