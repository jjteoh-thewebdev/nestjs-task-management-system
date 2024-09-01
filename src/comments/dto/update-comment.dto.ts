import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateCommentDto {
  @IsOptional()
  @IsInt()
  userId?: number

  @IsOptional()
  @IsInt()
  taskId?: number

  @IsString()
  @MaxLength(150)
  content?: string
}
