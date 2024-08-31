import { Module } from '@nestjs/common'
import { CommentDiKeys } from './constants/di'
import { CommentsController } from './comments.controller'
import { CommentService } from './comment.service'

@Module({
  providers: [
    {
      provide: CommentDiKeys.COMMENT_SERVICE,
      useClass: CommentService,
    },
  ],
  controllers: [CommentsController],
})
export class CommentModule {}
