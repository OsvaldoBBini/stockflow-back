import { Logger } from '@aws-lambda-powertools/logger';
import { 
  CodeMismatchException, 
  InvalidPasswordException,
  UsernameExistsException, 
  UserNotFoundException, 
  UserNotConfirmedException, 
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity-provider';
import z, { ZodError } from 'zod';

export class ErrorManager {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dispatchLoggerMessage = (e: any) => {
    this.logger.error(JSON.stringify({error: e.stack}));
  };


  public errorHandler = (e: unknown) => {

    if(e instanceof ZodError) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: z.treeifyError(e) })
      };
    }

    if (e instanceof UsernameExistsException) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'E-mail already in used' })
      };
    }

    if (e instanceof UserNotFoundException) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    if (e instanceof UserNotConfirmedException) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User not confirmed' })
      };
    }

    if (e instanceof CodeMismatchException) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'The confirmation code is not valid' })
      };
    }

    if (e instanceof InvalidPasswordException) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid Password' })
      };
    }

    if (e instanceof NotAuthorizedException) {
      this.dispatchLoggerMessage(e);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Incorrect username or password' })
      };
    }
      
    this.dispatchLoggerMessage(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Something went wrong' })
    };
  };

}