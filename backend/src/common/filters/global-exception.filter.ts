import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Server-Sent events handling exception:
    // If headers are already sent (SSE active), we cannot change status, we can only end the stream or send an error event.
    // For standard HTTP initialization errors, we use standard JSON format.
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || res;
    } else if (exception instanceof Error) {
      // Check for common OpenAI errors like Rate Limit (429)
      if (exception.message.includes('429')) {
        status = HttpStatus.TOO_MANY_REQUESTS;
        message = 'AI Provider Rate Limit Exceeded';
      } else {
        message = exception.message;
      }
    }

    if (response.headersSent) {
      // Stream is already open, cannot send 400/500 code headers
      // Write error event so the client knows SSE failed mid-stream
      response.write(`event: error\ndata: ${JSON.stringify({ statusCode: status, message })}\n\n`);
      response.end();
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
