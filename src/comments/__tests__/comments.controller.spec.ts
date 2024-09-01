import { instance, mock, resetCalls, verify, when } from 'ts-mockito'
import { CommentsController } from '../comments.controller'
import { CommentService } from '../comment.service'
import { CacheModule } from '@nestjs/cache-manager'
import { Test } from '@nestjs/testing'
import { CommentDiKeys } from '../constants/di'
import { NotFoundException } from '@nestjs/common'
import { QueryCommentsDto } from '../dto/query-comments.dto'
import { commentFixtures } from './comments.fixture'
import { Comment } from '@prisma/client'
import { PaginatedResult } from '../../common/models/paginated-result'
import { CreateCommentDto } from '../dto/create-comment.dto'
import { UpdateCommentDto } from '../dto/update-comment.dto'
import { ReplaceCommentDto } from '../dto/replace-comment.dto'

describe(CommentsController.name, () => {
  let commentsController: CommentsController

  const mockedCommentService = mock(CommentService)

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentDiKeys.COMMENT_SERVICE,
          useValue: instance(mockedCommentService),
        },
      ],
    }).compile()

    commentsController = await moduleRef.resolve<CommentsController>(
      CommentsController,
    )

    resetCalls(mockedCommentService)
  })

  describe(`findOne`, () => {
    it(`should return one comment on success`, async () => {
      // arrange
      const id = 1
      const comment: Comment | null =
        commentFixtures.find((comment) => comment.id === id) ?? null
      when(mockedCommentService.findOne(id)).thenResolve(comment)

      // act
      const actual = await commentsController.findOne(id)

      // assert
      expect(actual).toBe(comment)
      verify(mockedCommentService.findOne(id)).once()
    })

    it(`should throw ${NotFoundException.name} when non-int id was provided`, async () => {
      // arrange
      const invalidId: any = `nan`

      // act & assert
      await expect(commentsController.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      )
      verify(mockedCommentService.findOne(invalidId)).never()
    })

    it(`should throw ${NotFoundException.name} when invalid id provided`, async () => {
      // arrange
      const id = 99999999
      when(mockedCommentService.findOne(id)).thenResolve(null)

      // act & assert
      await expect(commentsController.findOne(id)).rejects.toThrow(
        NotFoundException,
      )
      verify(mockedCommentService.findOne(id)).once()
    })
  })

  describe(`findMany`, () => {
    it(`should return paginated comments on success`, async () => {
      // arrange
      const dto: QueryCommentsDto = {
        pagination: {
          page: 1,
          pageSize: 1,
        },
        filters: {
          taskId: 1,
        },
      }
      const comments: Comment[] = commentFixtures
        .filter((comment) => comment.taskId === dto.filters?.taskId)
        .slice(dto.pagination?.page, dto.pagination?.pageSize)
      const paginatedResult: PaginatedResult<Comment> = {
        data: comments,
        pagination: {
          page: dto.pagination?.page ?? 1,
          pageSize: dto.pagination?.pageSize ?? 1,
          pageCount: Math.ceil(
            commentFixtures.length / (dto.pagination?.pageSize ?? 10),
          ),
          total: commentFixtures.length,
        },
      }

      when(mockedCommentService.findMany(dto)).thenResolve(paginatedResult)

      // act
      const actual = await commentsController.find(dto)

      // assert
      expect(actual).toBe(paginatedResult)
      verify(mockedCommentService.findMany(dto)).once()
    })
  })

  describe(`create`, () => {
    it(`should return created task`, async () => {
      // arrange
      const dto: CreateCommentDto = {
        userId: 1,
        taskId: 1,
        content: `test`,
      }
      const newComment: Comment = {
        id: 1,
        userId: dto.userId,
        taskId: dto.taskId,
        content: dto.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }

      when(mockedCommentService.create(dto)).thenResolve(newComment)

      // act
      const actual = await commentsController.create(dto)

      // assert
      expect(actual).toBe(newComment)
      verify(mockedCommentService.create(dto)).once()
    })
  })

  describe(`replaceOne`, () => {
    it(`should return updated task on success`, async () => {
      // arrange
      const id = 1
      const dto: ReplaceCommentDto = {
        userId: 1,
        taskId: 1,
        content: `test`,
      }
      const existedComment = commentFixtures.find((c) => c.id === id)

      if (!existedComment) throw new Error(`existedTask should not be null`)

      const updatedComment: Comment = {
        id: existedComment.id,
        userId: dto.userId || existedComment.userId,
        taskId: dto.taskId || existedComment.taskId,
        content: dto.content || existedComment.content,
        createdAt: existedComment.createdAt,
        updatedAt: new Date(),
        deletedAt: existedComment.deletedAt,
      }

      when(mockedCommentService.updateOne(id, dto)).thenResolve(updatedComment)

      // act
      const actual = await commentsController.replaceOne(id, dto)

      // assert
      expect(actual).toBe(updatedComment)
      verify(mockedCommentService.updateOne(id, dto)).once()
    })
  })

  describe(`updateOne`, () => {
    it(`should return updated task on success`, async () => {
      // arrange
      const id = 1
      const dto: UpdateCommentDto = {
        userId: 1,
        taskId: 1,
        content: `test`,
      }
      const existedComment = commentFixtures.find((c) => c.id === id)

      if (!existedComment) throw new Error(`existedTask should not be null`)

      const updatedComment: Comment = {
        id: existedComment.id,
        userId: dto.userId || existedComment.userId,
        taskId: dto.taskId || existedComment.taskId,
        content: dto.content || existedComment.content,
        createdAt: existedComment.createdAt,
        updatedAt: new Date(),
        deletedAt: existedComment.deletedAt,
      }

      when(mockedCommentService.updateOne(id, dto)).thenResolve(updatedComment)

      // act
      const actual = await commentsController.UpdateOne(id, dto)

      // assert
      expect(actual).toBe(updatedComment)
      verify(mockedCommentService.updateOne(id, dto)).once()
    })
  })

  describe(`deleteOne`, () => {
    it(`should called delete once and return nothing`, async () => {
      // arrange
      const id = 1
      when(mockedCommentService.deleteOne(id)).thenResolve()

      // act
      await commentsController.deleteOne(id)

      // assert
      verify(mockedCommentService.deleteOne(id)).once()
    })
  })
})
