import { Test } from '@nestjs/testing'
import { TasksController } from '../tasks.controller'
import { TaskService } from '../task.service'
import { TaskDiKeys } from '../constants/di'
import { instance, mock, resetCalls, verify, when } from 'ts-mockito'
import { Task, TaskStatus } from '@prisma/client'
import { tasksFixtures } from './task.fixture'
import { CacheModule } from '@nestjs/cache-manager'
import { QueryTasksDto } from '../dto/query-tasks.dto'
import { PaginatedResult } from '../../common/models/paginated-result'
import { CreateTaskDto } from '../dto/create-task.dto'
import { ReplaceTaskDto } from '../dto/replace-task.dto'
import { NotFoundException } from '@nestjs/common'
import { UpdateTaskDto } from '../dto/update-task.dto'

describe(TasksController.name, () => {
  let tasksController: TasksController

  const mockedTaskService = mock(TaskService)

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [TasksController],
      providers: [
        {
          provide: TaskDiKeys.TASK_SERVICE,
          useValue: instance(mockedTaskService),
        },
      ],
    }).compile()

    tasksController = await moduleRef.resolve<TasksController>(TasksController)

    resetCalls(mockedTaskService)
  })

  describe(`findOne`, () => {
    it(`should return one task on success`, async () => {
      // arrange
      const id = 1
      const task: Task | null =
        tasksFixtures.find((task) => task.id === id) ?? null
      when(mockedTaskService.findOne(id)).thenResolve(task)

      // act
      const actual = await tasksController.findOne(id)

      // assert
      expect(actual).toBe(task)
      verify(mockedTaskService.findOne(id)).once()
    })

    it(`should throw ${NotFoundException.name} when non-int id was provided`, async () => {
      // arrange
      const invalidId: any = `nan`

      // act & assert
      await expect(tasksController.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      )
      verify(mockedTaskService.findOne(invalidId)).never()
    })

    it(`should throw ${NotFoundException.name} when invalid id provided`, async () => {
      // arrange
      const id = 99999999
      when(mockedTaskService.findOne(id)).thenResolve(null)

      // act & assert
      await expect(tasksController.findOne(id)).rejects.toThrow(
        NotFoundException,
      )
      verify(mockedTaskService.findOne(id)).once()
    })
  })

  describe(`find`, () => {
    it(`should return paginated tasks on success`, async () => {
      // arrange
      const dto: QueryTasksDto = {
        pagination: {
          page: 1,
          pageSize: 1,
        },
        filters: {
          title: `title1`,
        },
      }
      const tasks: Task[] = tasksFixtures
        .filter((task) => task.title === dto.filters?.title)
        .slice(dto.pagination?.page, dto.pagination?.pageSize)
      const paginatedResult: PaginatedResult<Task> = {
        data: tasks,
        pagination: {
          page: dto.pagination?.page ?? 1,
          pageSize: dto.pagination?.pageSize ?? 1,
          pageCount: Math.ceil(
            tasksFixtures.length / (dto.pagination?.pageSize ?? 10),
          ),
          total: tasksFixtures.length,
        },
      }

      when(mockedTaskService.findMany(dto)).thenResolve(paginatedResult)

      // act
      const actual = await tasksController.find(dto)

      // assert
      expect(actual).toBe(paginatedResult)
      verify(mockedTaskService.findMany(dto)).once()
    })
  })

  describe(`create`, () => {
    it(`should return created task`, async () => {
      // arrange
      const dto: CreateTaskDto = {
        title: `test`,
        description: `test`,
        priority: 1,
        createdBy: 1,
      }
      const newTask: Task = {
        id: 1,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate || null,
        priority: dto.priority || null,
        storyPoint: dto.storyPoint || null,
        status: TaskStatus.OPEN,
        createdById: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }

      when(mockedTaskService.create(dto)).thenResolve(newTask)

      // act
      const actual = await tasksController.create(dto)

      // assert
      expect(actual).toBe(newTask)
      verify(mockedTaskService.create(dto)).once()
    })
  })

  describe(`replaceOne`, () => {
    it(`should return updated task on success`, async () => {
      // arrange
      const id = 1
      const dto: ReplaceTaskDto = {
        title: `test`,
        description: `test`,
        dueDate: null,
        storyPoint: null,
        status: null,
        priority: 1,
        createdBy: 1,
        labels: [],
        assignees: null,
      }
      const existedTask = tasksFixtures.find((t) => t.id === id)

      if (!existedTask) throw new Error(`existedTask should not be null`)

      const updatedTask: Task = {
        id: existedTask.id,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate || existedTask.dueDate,
        priority: dto.priority || existedTask.priority,
        storyPoint: dto.storyPoint || existedTask.storyPoint,
        status: TaskStatus.OPEN,
        createdById: 1,
        createdAt: existedTask.createdAt,
        updatedAt: new Date(),
        deletedAt: existedTask.deletedAt,
      }

      when(mockedTaskService.updateOne(id, dto, true)).thenResolve(updatedTask)

      // act
      const actual = await tasksController.replaceOne(id, dto)

      // assert
      expect(actual).toBe(updatedTask)
      verify(mockedTaskService.updateOne(id, dto, true)).once()
    })
  })

  describe(`updateOne`, () => {
    it(`should return updated task on success`, async () => {
      // arrange
      const id = 1
      const dto: UpdateTaskDto = {
        title: `test`,
        description: `test`,
        dueDate: null,
        storyPoint: null,
        status: null,
        priority: 1,
        createdBy: 1,
        labels: [],
        assignees: null,
      }
      const existedTask = tasksFixtures.find((t) => t.id === id)

      if (!existedTask) throw new Error(`existedTask should not be null`)

      const updatedTask: Task = {
        id: existedTask.id,
        title: dto.title || existedTask.title,
        description: dto.description || existedTask.description,
        dueDate: dto.dueDate || existedTask.dueDate,
        priority: dto.priority || existedTask.priority,
        storyPoint: dto.storyPoint || existedTask.storyPoint,
        status: TaskStatus.OPEN,
        createdById: 1,
        createdAt: existedTask.createdAt,
        updatedAt: new Date(),
        deletedAt: existedTask.deletedAt,
      }

      when(mockedTaskService.updateOne(id, dto)).thenResolve(updatedTask)

      // act
      const actual = await tasksController.updateOne(id, dto)

      // assert
      expect(actual).toBe(updatedTask)
      verify(mockedTaskService.updateOne(id, dto)).once()
    })
  })

  describe(`deleteOne`, () => {
    it(`should called delete once and return nothing`, async () => {
      // arrange
      const id = 1
      when(mockedTaskService.deleteOne(id)).thenResolve()

      // act
      await tasksController.deleteOne(id)

      // assert
      verify(mockedTaskService.deleteOne(id)).once()
    })
  })
})
