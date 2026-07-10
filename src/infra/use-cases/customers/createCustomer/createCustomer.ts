import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import z from 'zod';
import { customerRepository } from '../repository/customerRepository';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

const logger = new Logger({ serviceName: 'createCustomer' });
const { errorHandler } = new ErrorManager(logger);

const createCustomerSchema = z.object({
  email: z.email({message: 'Invalid email format.'}).optional(),
  cpf: z.string().regex(/^\d{11}$/, { message: 'CPF must be 11 digits long.' }),
  phoneNumber: z.string().regex(/^[1-9]{2}9\d{8}$/, { message: 'Phone number must be 11 digits long.' }),
  fullName: z.string().min(2, {message: 'Full name must be at least 2 characters long.'}).max(50, {message: 'Full name must be at most 50 characters long.'}),
});

export async function handler(event: APIGatewayProxyEvent) {

  try {   
    const { companyId } = event.pathParameters || {};

    const { 
      email, 
      cpf,
      phoneNumber,
      fullName } = createCustomerSchema.parse(JSON.parse(event.body || ''));

    logger.debug({ message: 'Input validation successful', email, fullName, cpf, phoneNumber });

    const customerExists = await customerRepository.getCustomer(companyId!, cpf);
    if (customerExists) {
      return {
        statusCode: 409,
        body: JSON.stringify({data: { message: 'Customer with this CPF already exists' } }),
      };
    }

    await customerRepository.storeCustomer({companyId: companyId!, email, cpf, phoneNumber, fullName });
  
    return {
      statusCode: 201,
      body: JSON.stringify(
        { 
          data: { customer: { email, cpf, phoneNumber, fullName } }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}