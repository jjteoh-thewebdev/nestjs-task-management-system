import { TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
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
  @IsString()
  labels?: string

  @IsOptional()
  @IsString()
  assignee?: string

  @IsOptional()
  @IsString()
  createdBy?: string

  @IsOptional()
  @IsInt()
  storyPoint?: number

  @IsOptional()
  @IsInt()
  priority?: number
}

export class QueryTasksDto extends QueryDto<QueryTasksFilter> {
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryTasksFilter)
  filters?: QueryTasksFilter
}
