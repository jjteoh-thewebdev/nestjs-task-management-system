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
  @IsString()
  @MaxLength(150)
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date

  @IsOptional()
  @IsInt()
  @Min(1) // 1 - low
  @Max(3) // 3 - high
  priority?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  storyPoint?: number

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsInt()
  createdBy: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assignees?: number[]
}
