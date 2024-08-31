import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

/**
 * Filter that catch HTTP Exception and parse to standard response body
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const internalMessage = exception.getResponse()[`message`]
    const message = Array.isArray(internalMessage)
      ? internalMessage[0]
      : internalMessage || exception.message

    response
      .status(exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        data: null,
        error: message,
      })
  }
}
