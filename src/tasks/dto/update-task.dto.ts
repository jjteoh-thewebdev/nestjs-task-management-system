import { TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date | null

  @IsOptional()
  @IsInt()
  @Min(1) // 1 - low
  @Max(3) // 3 - high
  priority?: number | null

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  storyPoint?: number | null

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus | null

  @IsOptional()
  @IsInt()
  createdBy?: number // in real world application, this maybe extracted from auth token or session

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[] | null

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assignees?: number[] | null
}
