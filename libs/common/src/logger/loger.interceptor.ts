import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

export class ApplicationLogger implements NestInterceptor {
  private readonly logger: Logger = new Logger('RequestLogger');
  private readonly nodeEnvronment: string;

  constructor(private readonly configService: ConfigService) {
    this.nodeEnvronment = configService.get('NODE_ENV');
  }

  /**
   * Intercept the request and response and log the details.
   * @param context - The execution context of the request.
   * @param next - The next handler in the chain.
   * @returns An observable of the response.
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const request: FastifyRequest = httpContext.getRequest();
    const response: FastifyReply = httpContext.getResponse();
    const requestId = this.applyRequestId(request, response);

    const { method, originalUrl } = request;
    const start = Date.now();

    // Log incoming request with the generated request ID
    this.logRequest(requestId, method, originalUrl, 'Incoming Request');

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logResponse(
            requestId,
            method,
            originalUrl,
            response.statusCode,
            duration,
          );
        },
        error: (error: HttpException) => {
          if (this.nodeEnvronment !== 'test') {
            if (this.nodeEnvronment === 'development') {
              console.log(error.stack);
            }

            const duration = Date.now() - start;
            this.logError(
              requestId,
              method,
              originalUrl,
              error?.getStatus ? error.getStatus() : 500,
              duration,
              error.message,
            );
          }
        },
      }),
    );
  }

  /**
   * Applies a unique request ID to the given request and response objects.
   * The ID is generated using UUID v4 and is set in both the request and response headers as 'x-request-id'.
   * @param request The Fastify request object.
   * @param response The Fastify response object.
   * @returns The request ID that was generated.
   */
  private applyRequestId(
    request: FastifyRequest,
    response: FastifyReply,
  ): string {
    const requestId = uuidv4(); // Generate a unique request ID

    // Set the request ID in request headers (for internal usage)
    request.headers['x-request-id'] = requestId;

    // Set the request ID in the response headers (to be sent back to the client)
    response.header('x-request-id', requestId);
    return requestId;
  }

  /**
   * Logs a message when a request is received.
   * @param requestId The unique request ID.
   * @param method The HTTP method (e.g., GET, POST).
   * @param url The requested URL.
   * @param message The log message.
   */
  private logRequest(
    requestId: string,
    method: string,
    url: string,
    message: string,
  ): void {
    const logMessage = `[Request ID: ${requestId}] ${message}: ${method} ${url}`;
    this.logger.log(logMessage);
  }

  /**
   * Logs a message for successful responses.
   * @param requestId The unique request ID.
   * @param method The HTTP method (e.g., GET, POST).
   * @param url The requested URL.
   * @param statusCode The HTTP status code of the response.
   * @param duration The duration of the request in milliseconds.
   */
  private logResponse(
    requestId: string,
    method: string,
    url: string,
    statusCode: number,
    duration: number,
  ): void {
    const logMessage = `[Request ID: ${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms`;
    this.logger.log(logMessage);
  }

  /**
   * Logs a message for failed responses (errors).
   * @param requestId The unique request ID.
   * @param method The HTTP method (e.g., GET, POST).
   * @param url The requested URL.
   * @param statusCode The HTTP status code of the response.
   * @param duration The duration of the request in milliseconds.
   * @param errorMessage The error message.
   */
  private logError(
    requestId: string,
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    errorMessage: string,
  ): void {
    const logMessage = `[Request ID: ${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - Error: ${errorMessage}`;
    this.logger.error(logMessage);
  }
}
