import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './updateCustomer';
import * as customerRepositoryModule from '../repository/customerRepository';

// Mock the entire repository module
vi.mock('../repository/customerRepository', () => ({
  customerRepository: {
    getCustomer: vi.fn(),
    storeCustomer: vi.fn(),
    updateCustomer: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCustomerRepository = customerRepositoryModule.customerRepository as any;

describe('updateCustomer handler', () => {

  const mockCompanyId = '599b80c6-6428-4863-a255-f85f986c24e2';
  const mockCustomerId = 'customer-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerRepository.getCustomer.mockReset();
    mockCustomerRepository.storeCustomer.mockReset();
    mockCustomerRepository.updateCustomer.mockReset();
  });

  it('should update a customer successfully', async () => {

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId
      }
    } as unknown as APIGatewayProxyEvent;

    // Mock repository methods
    mockCustomerRepository.getCustomer.mockResolvedValueOnce(undefined);
    mockCustomerRepository.updateCustomer.mockResolvedValueOnce(mockCustomerId);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.customer.cpf).toBe('12345678901');

    expect(mockCustomerRepository.updateCustomer).toHaveBeenCalledWith({
      companyId: mockCompanyId,
      customerId: mockCustomerId,
      email: 'john.doe@example.com',
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe'
    });
  });
  
  it('should return error when CPF format is invalid', async () => {

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '123456789',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId
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
        phoneNumber: '11987654',
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
              sub: mockCustomerId
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
              sub: mockCustomerId
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
              sub: mockCustomerId
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

  it('should update customer with optional email field omitted', async () => {

    const mockCpf = '12345678901';

    const event = {
      body: JSON.stringify({
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId
      },
    } as unknown as APIGatewayProxyEvent;
    
    mockCustomerRepository.updateCustomer.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.customer.cpf).toBe(mockCpf);
  });

  it('should return error when body is empty', async () => {

    const event = {
      body: '',
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should return error when required fields are missing', async () => {

    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com'
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(422);
  });

});