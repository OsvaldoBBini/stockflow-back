import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './singUp';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';


describe('signUp', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const mockUserSub = 'user-test-sub';

  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'ValidPassword1!',
      firstName: 'TestFirstName',
      lastName: 'TestLastName',
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

  it('should sing up the new user', async () => {

    cognitoMock.on(SignUpCommand).resolves({
      UserSub: mockUserSub
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      user: { id: mockUserSub }
    });
  });

  it('should return a 400 with an error message indicating invalid input data', async () => {
    cognitoMock.on(SignUpCommand).resolves({
      UserSub: mockUserSub
    });
  
    const emptyBodyEvent = { body: JSON.stringify({}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);
  
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: {
        'errors': [],
        'properties': {
          'email': {
            'errors':  [
              'Invalid email format.',
            ],
          },
          'firstName': {
            'errors':  [
              'Invalid input: expected string, received undefined',
            ],
          },
          'lastName': {
            'errors':  [
              'Invalid input: expected string, received undefined',
            ],
          },
          'password': {
            'errors':  [
              'Invalid input: expected string, received undefined',
            ],
          },
        },
      },
    });
  });

  it('should return a 400 with an error message indicating invalid password', async () => {
    cognitoMock.on(SignUpCommand).resolves({
      UserSub: mockUserSub
    });

    const body = JSON.parse(event.body || '');
    const emptyBodyEvent = { body:  JSON.stringify({...body, password: ''}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);
  
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: {
        'errors': [],
        'properties': {
          'password': {
            'errors': [
              'Password must be at least 8 characters long.',
              'Password must contain at least one uppercase letter.',
              'Password must contain at least one number.',
              'Password must contain at least one special character.',
            ]
          }
        }
      },
    });
  });

  it('should return a 409 with an error message indicating already in used e-mail', async () => {

    const mockError = new UsernameExistsException('');
    cognitoMock.on(SignUpCommand).rejects(mockError);

    const response = await handler(event);

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({
      message: 'E-mail already in used'
    });
  });

  it('should return a 500 with a generic error message ', async () => {
    const mockError = new Error('Cognito service is down');
    cognitoMock.on(SignUpCommand).rejects(mockError);
    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Something went wrong',
    });
  });

});