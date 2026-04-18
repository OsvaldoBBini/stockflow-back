import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './createCustomer';

const dbMock = mockClient(DynamoDBDocumentClient);

describe('createCustomer', () => {

  beforeEach(() => {
    dbMock.reset();
    vi.clearAllMocks();
  });

  it('should create a new customer successfully', async () => {

    const mockUserId = '12345-abcde';
    const mockCpf = '12345678901';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: mockCpf,
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    // Mock getCustomer to return undefined (customer doesn't exist)
    dbMock.on(GetCommand).resolves({
      $metadata: { httpStatusCode: 200 }
    });

    // Mock storeCustomer to succeed
    dbMock.on(PutCommand).resolves({
      $metadata: { httpStatusCode: 200 }
    });

    const response = await handler(event);

    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.message).toBe('Customer created successfully');
    expect(responseBody.cpf).toBe(mockCpf);
  });

  it('should return 409 when customer with same CPF already exists', async () => {

    const mockUserId = '12345-abcde';
    const mockCpf = '12345678901';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: mockCpf,
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    // Mock getCustomer to return existing customer
    dbMock.on(GetCommand).resolves({
      Item: {
        PK: `USER#${mockUserId}#CUSTOMERS`,
        SK: `CUSTOMER#${mockCpf}`,
        email: 'john.doe@example.com',
        cpf: mockCpf,
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      },
      $metadata: { httpStatusCode: 200 }
    });

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(409);
    expect(responseBody.message).toBe('Customer with this CPF already exists');
  });

  it('should return error when CPF format is invalid', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '123456789', // Only 9 digits instead of 11
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(responseBody.message.properties).toHaveProperty('cpf');
  });

  it('should return error when phone number format is invalid', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654', // Invalid format
        fullName: 'John Doe'
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(responseBody.message.properties).toHaveProperty('phoneNumber');
  });

  it('should return error when email format is invalid', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: JSON.stringify({
        email: 'invalid-email',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(responseBody.message.properties).toHaveProperty('email');
  });

  it('should return error when fullName is too short', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'J' // Only 1 character
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(responseBody.message.properties).toHaveProperty('fullName');
  });

  it('should return error when fullName is too long', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'A'.repeat(51) // 51 characters
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(responseBody.message.properties).toHaveProperty('fullName');
  });

  it('should create customer with optional email field omitted', async () => {

    const mockUserId = '12345-abcde';
    const mockCpf = '12345678901';

    const event = {
      body: JSON.stringify({
        cpf: mockCpf,
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    dbMock.on(GetCommand).resolves({
      $metadata: { httpStatusCode: 200 }
    });

    dbMock.on(PutCommand).resolves({
      $metadata: { httpStatusCode: 200 }
    });

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.message).toBe('Customer created successfully');
    expect(responseBody.cpf).toBe(mockCpf);
  });

  it('should return error when body is empty', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: '',
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    // const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
  });

  it('should return error when required fields are missing', async () => {

    const mockUserId = '12345-abcde';

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com'
        // Missing cpf, phoneNumber, fullName
      }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

});