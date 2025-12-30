/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@aws-lambda-powertools/logger';
import { ZodError } from 'zod';

export class ErrorManager {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public dispatchLoggerMessage = (e: any) => {
    this.logger.error(JSON.stringify({error: e.stack}));
  };

  public errorHandler = (e: any) => {

    if(e instanceof ZodError) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 400,
        body: JSON.stringify({message: 'Invalid input data'})
      };
    }
      
    this.dispatchLoggerMessage(e);
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Something went wrong'})
    };
  };

}