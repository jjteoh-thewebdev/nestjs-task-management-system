import { Type } from 'class-transformer'
import { IsInt, IsOptional, ValidateNested } from 'class-validator'
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
}

export class QueryCommentsDto extends QueryDto<QueryCommentsFilter> {
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryCommentsFilter)
  filters?: QueryCommentsFilter
}
