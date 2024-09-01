import { TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { QueryDto } from '../../common/models/query.dto'

export class QueryTasksFilter {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  labels?: number[]

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  assigneeId?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  createdById?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  storyPoint?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAtStart?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAtEnd?: Date
}

export class QueryTasksDto extends QueryDto<QueryTasksFilter> {
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryTasksFilter)
  filters?: QueryTasksFilter
}
