import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'

interface IResponse<T> {
  data?: T
  error?: string
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

/**
 * Standardize response format
 */
@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        const { pagination } = data

        return {
          error: null,
          data,
          pagination,
        }
      }),
    )
  }
}
