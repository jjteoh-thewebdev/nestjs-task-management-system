import { IsInt, IsString } from 'class-validator'

export class UpdateCommentDto {
  @IsInt()
  userId: number

  @IsInt()
  taskId: number

  @IsString()
  content: string
}
