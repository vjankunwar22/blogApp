

type ErrorType = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT'|'INTERNAL_SERVER_ERROR';


export class HttpError extends Error {
  status: number;
  constructor(errorType: ErrorType = 'INTERNAL_SERVER_ERROR', message: string, stack?: string) {
    super(message);
    this.status = errorType === 'BAD_REQUEST' ? 400 : errorType === 'UNAUTHORIZED' ? 401 : errorType === 'FORBIDDEN' ? 403 : errorType === 'NOT_FOUND' ? 404: errorType==="CONFLICT" ? 409 : 500;
    this.message = message;
    this.stack = stack;
  }
}