import { Type } from 'class-transformer'
import {
  IsOptional,
  ValidateNested,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator'

export class QueryPagination {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(Number.MAX_VALUE)
  @Type(() => Number)
  page?: number

  @IsOptional()
  @Min(0)
  @Max(1000)
  @IsInt()
  @Type(() => Number)
  pageSize?: number
}

export class QueryDto<T> {
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryPagination)
  pagination?: QueryPagination

  @IsOptional()
  @IsString({ each: true })
  sort?: string[] // format key:asc|desc

  filters?: T // filters[field]='hello'
}
