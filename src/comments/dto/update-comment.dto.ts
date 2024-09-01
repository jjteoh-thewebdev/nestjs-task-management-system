import { IsInt, IsString, MaxLength } from 'class-validator'

export class UpdateCommentDto {
  @IsInt()
  userId: number

  @IsInt()
  taskId: number

  @IsString()
  @MaxLength(150)
  content: string
}
