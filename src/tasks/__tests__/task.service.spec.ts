import { TaskService } from '../task.service'
import { tasksFixtures } from './task.fixture'
import { mockedPrisma, mockedPrismaService } from '../../prisma/prisma.mock'
import { mockReset } from 'jest-mock-extended'
import { Task } from '@prisma/client'

describe(TaskService.name, () => {
  const taskService = new TaskService(mockedPrismaService)

  beforeEach(() => {
    // reset call counter
    mockReset(mockedPrisma)
  })

  describe(`findOne`, () => {
    it(`should return one task on success`, async () => {
      // arrange
      const id = 1
      const expected: Task | null =
        tasksFixtures.find((t) => t.id === id) ?? null

      mockedPrismaService.task.findUnique.mockResolvedValueOnce(expected)

      // act
      const actual = await taskService.findOne(id)

      // assert
      expect(actual).toEqual(expected)
      expect(mockedPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id, deletedAt: null },
        include: {
          labels: {
            include: {
              label: true,
            },
          },
          assignees: {
            include: {
              user: true,
            },
          },
          comments: true,
        },
      })
    })
  })

  //   describe(`findMany`, () => {
  //     it(`should return query result on success`, async () => {})
  //   })

  //   describe(`create`, () => {
  //     it(`should return created task on success`, async () => {})
  //     it(`should throw ${BadRequestException.name} when invalid createdBy provided`, async () => {})
  //     it(`should throw ${BadRequestException.name} when invalid assignees provided`, async () => {})
  //   })

  //   describe(`replaceOne`, () => {
  //     it(`should return updated task on success`, async () => {})
  //   })

  //   describe(`deleteOne`, () => {
  //     it(`should soft delete task on success`, async () => {})
  //     it(`should do nothing when invalid id is provided`, async () => {})
  //   })
})
