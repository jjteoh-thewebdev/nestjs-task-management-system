import { Type } from 'class-transformer'
import { IsDate, IsInt, IsOptional, ValidateNested } from 'class-validator'
import { QueryDto } from '../../common/models/query.dto'

export class QueryCommentsFilter {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  taskId?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAtStart?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAtEnd?: Date
}

export class QueryCommentsDto extends QueryDto<QueryCommentsFilter> {
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryCommentsFilter)
  filters?: QueryCommentsFilter
}
