import { IsInt, IsString } from 'class-validator'

export class CreateCommentDto {
  @IsInt()
  userId: number

  @IsInt()
  taskId: number

  @IsString()
  content: string
}
