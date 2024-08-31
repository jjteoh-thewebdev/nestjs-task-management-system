import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { tap } from 'rxjs'

/**
 * Log HTTP Response time
 */
@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const startTime = performance.now()

    return next.handle().pipe(
      tap(() => {
        const endTime = performance.now()
        const executionTime = endTime - startTime
        const request = context.switchToHttp().getRequest()
        const method = request.method
        const url = request.url

        console.log(
          `Method: ${method}, URL: ${url}, Execution Time: ${executionTime.toFixed(
            2,
          )} ms`,
        )
      }),
    )
  }
}
