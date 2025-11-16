import { Logger } from '@aws-lambda-powertools/logger';
import { ZodError } from 'zod';

export function errorHandler(e: unknown, logger: Logger) {

  if(e instanceof ZodError) {
    logger.error(JSON.stringify({error: e.stack}));
    return {
      statusCode: 400,
      body: JSON.stringify({message: 'Invalid input data'})
    };
  }
      
  logger.error(JSON.stringify({error: e}));
  return {
    statusCode: 500,
    body: JSON.stringify({message: 'Something went wrong'})
  };
  
}