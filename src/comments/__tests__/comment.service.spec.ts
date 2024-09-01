import { mockReset } from 'jest-mock-extended'
import { mockedPrisma, mockedPrismaService } from '../../prisma/prisma.mock'
import { CommentService } from '../comment.service'
import { Comment } from '@prisma/client'
import { commentFixtures } from './comments.fixture'

describe(CommentService.name, () => {
  const commentService = new CommentService(mockedPrismaService)

  beforeEach(() => {
    // reset calls
    mockReset(mockedPrisma)
  })

  describe(`findOne`, () => {
    it(`should return one comment on success`, async () => {
      // arrange
      const id = 1
      const expected: Comment | null =
        commentFixtures.find((c) => c.id === id) ?? null

      mockedPrismaService.comment.findUnique.mockResolvedValueOnce(expected)

      // act
      const actual = await commentService.findOne(id)

      // assert
      expect(actual).toBe(expected)
      expect(mockedPrismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id, deletedAt: null },
        include: { user: true },
      })
    })
  })

  // TODO: more test cases to come
  //   describe(`findMany`, () => {
  //     it(`should return query result on success`, async () => {})
  //   })

  //   describe(`create`, () => {
  //     it(`should return created comment on success`, async () => {})
  //     it(`should throw ${BadRequestException.name} when invalid userId provided`, async () => {})
  //     it(`should throw ${BadRequestException.name} when invalid taskId provided`, async () => {})
  //   })

  //   describe(`replaceOne`, () => {
  //     it(`should return updated comment on success`, async () => {})
  //   })

  //   describe(`deleteOne`, () => {
  //     it(`should soft delete task on success`, async () => {})
  //     it(`should do nothing when invalid id is provided`, async () => {})
  //   })
})
