import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'

/**
 * Catch all unhandled exception and parse to HTTP Internal Server Exception
 */
@Catch()
export class UnhandledExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly _httpAdapterHost: HttpAdapterHost) {
    super()
  }

  override catch(exception: any, host: ArgumentsHost) {
    const httpCtx = host.switchToHttp()
    const { httpAdapter } = this._httpAdapterHost

    let httpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Unhandled Exception.'

    if (exception instanceof HttpException) {
      const exceptionRes = exception.getResponse() as any
      httpStatusCode = exception.getStatus()
      message = exceptionRes?.message
    }

    const response = httpCtx.getResponse()

    if (httpAdapter) {
      httpAdapter.reply(
        response,
        {
          data: null,
          error: message,
        },
        httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
