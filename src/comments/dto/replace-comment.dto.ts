import { IsDefined, IsInt, IsString, MaxLength } from 'class-validator'

// the different between replace and update model
// is that replace model require all keys to present
export class ReplaceCommentDto {
  @IsDefined()
  @IsInt()
  userId!: number

  @IsDefined()
  @IsInt()
  taskId!: number

  @IsDefined()
  @IsString()
  @MaxLength(150)
  content!: string
}
