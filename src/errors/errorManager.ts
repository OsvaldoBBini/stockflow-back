import { Logger } from '@aws-lambda-powertools/logger';
import { ZodError } from 'zod';


export class ErrorManager {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dispatchLoggerMessage(e: any) {
    this.logger.error(JSON.stringify({error: e.stack}));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public errorHandler(e: any) {

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
  }

}