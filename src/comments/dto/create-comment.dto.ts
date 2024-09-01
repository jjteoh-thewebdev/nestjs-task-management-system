import { IsInt, IsString, MaxLength } from 'class-validator'

export class CreateCommentDto {
  @IsInt()
  userId: number

  @IsInt()
  taskId: number

  @IsString()
  @MaxLength(150)
  content: string
}
