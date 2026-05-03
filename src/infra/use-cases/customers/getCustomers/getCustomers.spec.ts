import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './getCustomers';
import * as customerRepositoryModule from '../repository/customerRepository';

// Mock the entire repository module
vi.mock('../repository/customerRepository', () => ({
  customerRepository: {
    getCustomers: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCustomerRepository = customerRepositoryModule.customerRepository as any;

describe('getCustomers handler', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerRepository.getCustomers.mockReset();
  });

  it('should return all customers for a user successfully', async () => {

    const mockUserId = '12345-abcde';
    const mockCustomers = [
      {
        userId: mockUserId,
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe'
      },
      {
        userId: mockUserId,
        email: 'jane.doe@example.com',
        cpf: '98765432109',
        phoneNumber: '11987654322',
        fullName: 'Jane Doe'
      }
    ];

    const event = {
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

    // Mock repository method
    mockCustomerRepository.getCustomers.mockResolvedValueOnce(mockCustomers);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toEqual(mockCustomers);
    expect(responseBody.data.items).toHaveLength(2);
    
    // Verify repository was called correctly
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledWith(mockUserId);
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no customers exist', async () => {

    const mockUserId = '12345-abcde';

    const event = {
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

    // Mock getCustomers to return undefined
    mockCustomerRepository.getCustomers.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toEqual([]);
    
    // Verify repository was called correctly
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledWith(mockUserId);
  });

  it('should return 401 when user ID is missing', async () => {

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {}
          }
        }
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(responseBody.data.message).toBe('Unauthorized: Missing user ID');
    
    // Verify repository was NOT called
    expect(mockCustomerRepository.getCustomers).not.toHaveBeenCalled();
  });

  it('should return 401 when authorizer is missing', async () => {

    const event = {
      requestContext: {}
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(responseBody.data.message).toBe('Unauthorized: Missing user ID');
    
    // Verify repository was NOT called
    expect(mockCustomerRepository.getCustomers).not.toHaveBeenCalled();
  });

  it('should handle repository errors gracefully', async () => {

    const mockUserId = '12345-abcde';

    const event = {
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

    // Mock getCustomers to throw an error
    mockCustomerRepository.getCustomers.mockRejectedValueOnce(new Error('Database connection failed'));

    const response = await handler(event);

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
    
    // Verify repository was called
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledWith(mockUserId);
  });

  it('should return single customer in array format', async () => {

    const mockUserId = '12345-abcde';
    const mockCustomers = [
      {
        userId: mockUserId,
        email: 'single.customer@example.com',
        cpf: '55555555555',
        phoneNumber: '11987654321',
        fullName: 'Single Customer'
      }
    ];

    const event = {
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

    // Mock repository method
    mockCustomerRepository.getCustomers.mockResolvedValueOnce(mockCustomers);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toHaveLength(1);
    expect(responseBody.data.items[0].cpf).toBe('55555555555');
    
    // Verify repository was called correctly
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledWith(mockUserId);
  });
});