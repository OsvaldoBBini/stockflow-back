import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './createCustomer';
import * as customerRepositoryModule from '../repository/customerRepository';

// Mock the entire repository module
vi.mock('../repository/customerRepository', () => ({
  customerRepository: {
    getCustomer: vi.fn(),
    storeCustomer: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCustomerRepository = customerRepositoryModule.customerRepository as any;

describe('createCustomer handler', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerRepository.getCustomer.mockReset();
    mockCustomerRepository.storeCustomer.mockReset();
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

    // Mock repository methods
    mockCustomerRepository.getCustomer.mockResolvedValueOnce(undefined);
    mockCustomerRepository.storeCustomer.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.customer.cpf).toBe(mockCpf);
    
    // Verify repository was called correctly
    expect(mockCustomerRepository.getCustomer).toHaveBeenCalledWith(mockUserId, mockCpf);
    expect(mockCustomerRepository.storeCustomer).toHaveBeenCalledWith(mockUserId, {
      email: 'john.doe@example.com',
      cpf: mockCpf,
      phoneNumber: '11987654321',
      fullName: 'John Doe'
    });
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
    mockCustomerRepository.getCustomer.mockResolvedValueOnce({
      userId: mockUserId,
      email: 'john.doe@example.com',
      cpf: mockCpf,
      phoneNumber: '11987654321',
      fullName: 'John Doe'
    });

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(409);
    expect(responseBody.data.message).toBe('Customer with this CPF already exists');
    
    // Verify storeCustomer was NOT called
    expect(mockCustomerRepository.storeCustomer).not.toHaveBeenCalled();
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

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('cpf');
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

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('phoneNumber');
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

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('email');
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

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('fullName');
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

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('fullName');
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

    mockCustomerRepository.getCustomer.mockResolvedValueOnce(undefined);
    mockCustomerRepository.storeCustomer.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.customer.cpf).toBe(mockCpf);
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

    expect(response.statusCode).toBe(422);
  });

});