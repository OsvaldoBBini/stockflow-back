import { Logger } from '@aws-lambda-powertools/logger';
import z, { ZodError } from 'zod';
import { 
  CodeMismatchException, 
  InvalidPasswordException,
  UsernameExistsException, 
  UserNotFoundException, 
  UserNotConfirmedException, 
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity-provider';


export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ErrorManager {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dispatchLoggerMessage = (e: any) => {
    this.logger.error(JSON.stringify({error: e.stack}));
  };

  private throwError = ( statusCode: number, message: string | { errors: string[] }) => {
    return {
      statusCode,
      body: JSON.stringify({ data: { message } })
    };
  };

  public errorHandler = (e: unknown) => {

    this.dispatchLoggerMessage(e);

    if (e instanceof DatabaseError) {
      return this.throwError(400, 'Database error occurred');
    }

    if(e instanceof ZodError) {
      return this.throwError(422, z.treeifyError(e));
    }

    if (e instanceof SyntaxError) {
      return this.throwError(400, 'Invalid request body format');
    }

    if (e instanceof UsernameExistsException) {
      return this.throwError(409, 'E-mail already in used');
    }

    if (e instanceof UserNotFoundException) {
      return this.throwError(404, 'User not found');
    }

    if (e instanceof UserNotConfirmedException) {
      return this.throwError(403, 'User not confirmed');
    }

    if (e instanceof CodeMismatchException) {
      return this.throwError(404, 'The confirmation code is not valid');
    }

    if (e instanceof InvalidPasswordException) {
      return this.throwError(400, 'Invalid Password');
    }

    if (e instanceof NotAuthorizedException) {
      return this.throwError(401, 'Incorrect username or password');
    }
      
    return this.throwError(500, 'Something went wrong');
  };
}