import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './setCompanyAsDefault';
import * as companyRepositoryModule from '../repository/companyRepository';

describe('setCompanyAsDefault Handler', () => {
  const mockUserId = 'user123';
  const mockCompanyId = '4a9d691f-7412-4051-81d5-2fb0477aeb2b';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set company as default successfully', async () => {
    const mockEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      },
      body: JSON.stringify({ companyId: mockCompanyId })
    } as unknown as APIGatewayProxyEvent;

    vi.spyOn(companyRepositoryModule.companyRepository, 'setDefaultCompany')
      .mockResolvedValueOnce({ companyId: mockCompanyId });

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body as string)).toEqual({
      data: { companyId: mockCompanyId }
    });
    expect(companyRepositoryModule.companyRepository.setDefaultCompany)
      .toHaveBeenCalledWith(mockCompanyId, mockUserId);
  });

  it('should reject invalid company ID format', async () => {
    const mockEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      },
      body: JSON.stringify({ companyId: 'invalid-id' })
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(422);
  });

  it('should handle repository errors', async () => {
    const mockEvent = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId
            }
          }
        }
      },
      body: JSON.stringify({ companyId: mockCompanyId })
    } as unknown as APIGatewayProxyEvent;

    vi.spyOn(companyRepositoryModule.companyRepository, 'setDefaultCompany')
      .mockRejectedValueOnce(new Error('Database error'));

    const result = await handler(mockEvent);

    expect(result.statusCode).toBeGreaterThanOrEqual(400);
  });
});
