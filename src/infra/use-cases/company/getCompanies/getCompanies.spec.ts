import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './getCompanies';
import * as companyRepositoryModule from '../repository/companyRepository';

vi.mock('../repository/companyRepository', () => ({
  companyRepository: {
    getCompanies: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCompanyRepository = companyRepositoryModule.companyRepository as any;

describe('getCompanies handler', () => {

  const mockUserId = 'user-abc';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyRepository.getCompanies.mockReset();
  });

  it('should return companies list successfully', async () => {

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

    const mockCompanies = [
      { companyId: 'c1', userId: mockUserId, companyName: 'One', role: 'owner' },
      { companyId: 'c2', userId: mockUserId, companyName: 'Two', role: 'member' }
    ];

    mockCompanyRepository.getCompanies.mockResolvedValueOnce(mockCompanies);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toHaveLength(2);
    expect(responseBody.data.items[0].companyName).toBe('One');

    expect(mockCompanyRepository.getCompanies).toHaveBeenCalledWith(mockUserId);
  });

  it('should return empty items when repository returns undefined', async () => {

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

    mockCompanyRepository.getCompanies.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toEqual([]);

    expect(mockCompanyRepository.getCompanies).toHaveBeenCalledWith(mockUserId);
  });

});
