import { TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator'

// the different between replace and update model
// is that replace model require all keys to present
export class ReplaceTaskDto {
  @IsString()
  @MaxLength(150)
  title!: string

  @IsString()
  description!: string

  @ValidateIf((o) => o.dueDate !== null)
  @IsDate()
  @Type(() => Date)
  dueDate!: Date | null

  @ValidateIf((o) => o.priority !== null)
  @IsInt()
  @Min(1) // 1 - low
  @Max(3) // 3 - high
  priority!: number | null

  @ValidateIf((o) => o.storyPoint !== null)
  @IsInt()
  @Min(1)
  @Max(99)
  storyPoint!: number | null

  @ValidateIf((o) => o.name !== null)
  @IsEnum(TaskStatus)
  status!: TaskStatus | null

  @IsInt()
  createdBy!: number

  @IsArray()
  @IsString({ each: true })
  labels!: string[] | null // null or empty arr will remove all existing task_labels

  @IsArray()
  @IsInt({ each: true })
  assignees!: number[] | null // null or empty arr will remove all existing assignees
}
