import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './createCompany';
import * as companyRepositoryModule from '../repository/companyRepository';

vi.mock('../repository/companyRepository', () => ({
  companyRepository: {
    createCompany: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCompanyRepository = companyRepositoryModule.companyRepository as any;

describe('createCompany handler', () => {

  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyRepository.createCompany.mockReset();
  });

  it('should create a new company successfully', async () => {

    const event = {
      body: JSON.stringify({ companyName: 'AcmeCorp' }),
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

    const mockCompany = {
      companyId: 'company-1',
      userId: mockUserId,
      companyName: 'AcmeCorp',
      role: 'owner'
    };

    mockCompanyRepository.createCompany.mockResolvedValueOnce(mockCompany);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.company.companyName).toBe('AcmeCorp');

    expect(mockCompanyRepository.createCompany).toHaveBeenCalledWith({
      userId: mockUserId,
      companyName: 'AcmeCorp',
      role: 'owner',
      isDefault: false
    });
  });

  it('should return 422 when companyName is too short', async () => {

    const event = {
      body: JSON.stringify({ companyName: 'A' }),
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
    expect(responseBody.data.message.properties).toHaveProperty('companyName');

    expect(mockCompanyRepository.createCompany).not.toHaveBeenCalled();
  });

  it('should return 400 when body is empty', async () => {

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

});
