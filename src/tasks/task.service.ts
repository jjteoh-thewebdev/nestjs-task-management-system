import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Label, Prisma, Task, TaskStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { ReplaceTaskDto } from './dto/replace-task.dto'
import { QueryTasksDto } from './dto/query-tasks.dto'
import { PaginatedResult } from '../common/models/paginated-result'
import { orderByParser } from '../common/utils/query.util'
import { UpdateTaskDto } from './dto/update-task.dto'

export interface ITaskService {
  findOne(id: number): Promise<Task | null>
  findMany(dto: QueryTasksDto): Promise<PaginatedResult<Task>>
  create(dto: CreateTaskDto): Promise<Task>
  // replaceOne(id: number, dto: ReplaceTaskDto): Promise<Task>
  updateOne(
    id: number,
    dto: UpdateTaskDto,
    isReplaceMode?: boolean,
  ): Promise<Task>
  deleteOne(id: number): Promise<void>
}

// for standardize output
const outputSignature = {
  include: {
    labels: {
      select: {
        label: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    assignees: {
      select: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
    createdBy: {
      select: {
        id: true,
        username: true,
      },
    },
  },
}

@Injectable()
export class TaskService implements ITaskService {
  constructor(private readonly _prisma: PrismaService) {}

  async findOne(id: number): Promise<Task | null> {
    return await this._prisma.task.findUnique({
      where: { id, deletedAt: null },
      ...outputSignature,
    })
  }

  async findMany(dto: QueryTasksDto = {}): Promise<PaginatedResult<Task>> {
    const { pagination, sort, filters } = dto

    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 10
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      createdAt: {
        lte: new Date(),
      },
    }

    if (filters) {
      for (const [field, value] of Object.entries(filters)) {
        if (typeof value === 'string' && field !== 'status') {
          // apply case-insensitive contains operator to all string variables
          where[field] = {
            contains: value,
          }
        } else {
          if (field === `createdById`) {
            where.createdBy = {
              id: filters.createdById,
            }
          } else if (field === `assigneeId`) {
            where.assignees = {
              some: { userId: filters.assigneeId },
            }
          } else if (field === `labels`) {
            where.labels = {
              every: { labelId: { in: filters.labels } },
            }
          } else if (field === `createdAtStart` && where.createdAt) {
            where.createdAt[`gte`] = filters.createdAtStart
          } else if (field === `createdAtEnd` && where.createdAt) {
            where.createdAt[`lte`] = filters.createdAtEnd
          } else {
            // Apply exact match for non-string fields
            where[field] = value
          }
        }
      }
    }

    const orderBy = orderByParser(sort)
    const skip = page ? (page - 1) * pageSize : 0
    const take = pageSize

    // fetch data
    const tasks = await this._prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      ...outputSignature,
    })

    // compute count
    const totalTasks = await this._prisma.task.count({ where })

    return {
      data: tasks,
      pagination: {
        total: totalTasks,
        pageCount: Math.ceil(totalTasks / pageSize),
        page: page,
        pageSize: pageSize,
      },
    }
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    // validate createdBy is valid
    if (!(await this._isValidUsers([dto.createdBy]))) {
      throw new BadRequestException(`createdBy must be a valid user`)
    }

    // validate assignees are valid
    if (dto.assignees && !(await this._isValidUsers(dto.assignees))) {
      throw new BadRequestException(`Invalid assignee found`)
    }

    return await this._prisma.$transaction(async () => {
      let labels: Label[] | null = null
      if (dto.labels && dto.labels.length > 0) {
        labels = await this._upsertLabels(dto.labels)
      }

      return await this._prisma.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          dueDate: dto.dueDate,
          priority: dto.priority,
          storyPoint: dto.storyPoint,
          status: dto.status ?? TaskStatus.OPEN,
          createdById: dto.createdBy,
          labels: labels
            ? {
                create: labels.map((label) => ({
                  labelId: label.id,
                })),
              }
            : undefined,
          assignees: dto.assignees
            ? {
                create: dto.assignees.map((assignee) => ({
                  userId: assignee,
                })),
              }
            : undefined,
        },
        ...outputSignature,
      })
    })
  }

  /*
   ** garbage-in-garbage-out approach, replace whatever provided in dto to database,
   ** if null/undefined is provided, the column in db will be cleared
   */
  // async replaceOne(id: number, dto: ReplaceTaskDto): Promise<Task> {
  //   // if not exist, don't proceed
  //   if (!(await this._prisma.task.count({ where: { id, deletedAt: null } }))) {
  //     throw new NotFoundException()
  //   }

  //   // validate createdBy is valid
  //   if (!(await this._isValidUsers([dto.createdBy]))) {
  //     throw new BadRequestException(`createdBy must be a valid user`)
  //   }

  //   return await this._prisma.$transaction(async () => {
  //     // upsert task labels
  //     await this._upsertTaskLabels(id, dto.labels)

  //     // upsert assignees
  //     await this._upsertAssignees(id, dto.assignees)

  //     return await this._prisma.task.update({
  //       where: {
  //         id,
  //         deletedAt: null,
  //       },
  //       data: {
  //         title: dto.title,
  //         description: dto.description,
  //         dueDate: dto.dueDate,
  //         priority: dto.priority,
  //         storyPoint: dto.storyPoint,
  //         status: dto.status || TaskStatus.OPEN,
  //         createdById: dto.createdBy,
  //       },
  //       ...outputSignature,
  //     })
  //   })
  // }

  async updateOne(
    id: number,
    dto: UpdateTaskDto | ReplaceTaskDto,
    isReplaceMode = false,
  ): Promise<Task> {
    // if not exist, don't proceed
    if (!(await this._prisma.task.count({ where: { id } }))) {
      throw new NotFoundException()
    }

    // validate createdBy is valid
    if (dto.createdBy && !(await this._isValidUsers([dto.createdBy]))) {
      throw new BadRequestException(`createdBy must be a valid user`)
    }

    return await this._prisma.$transaction(async () => {
      // if null/[] is provided, all assignees associated will be removed
      if (dto.assignees === null || dto.assignees || isReplaceMode) {
        // upsert assignees
        await this._upsertAssignees(id, dto.assignees)
      }

      // if null/[] is provided, all task_labels associated will be removed
      if (dto.labels || dto.labels === null || isReplaceMode) {
        // upsert labels
        await this._upsertTaskLabels(id, dto.labels)
      }

      return this._prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          dueDate: dto.dueDate,
          priority: dto.priority,
          storyPoint: dto.storyPoint,
          status: dto.status || TaskStatus.OPEN, // always default to OPEN if null or undefined
          createdById: dto.createdBy,
        },
        ...outputSignature,
      })
    })
  }

  async deleteOne(id: number): Promise<void> {
    // if not exist, just skip
    if (!(await this._prisma.task.count({ where: { id } }))) {
      return
    }

    await this._prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  private async _isValidUsers(ids: number[]): Promise<boolean> {
    const validUserIds = (
      await this._prisma.user.findMany({
        where: {
          id: { in: ids },
        },
        select: {
          id: true,
        },
      })
    ).map((user) => user.id)

    return ids.every((id) => validUserIds.includes(id))
  }

  private async _upsertLabels(labels: string[]): Promise<Label[]> {
    await this._prisma.label.createMany({
      data: labels.map((label) => ({
        name: label,
      })),

      skipDuplicates: true,
    })

    return await this._prisma.label.findMany({
      where: {
        name: {
          in: labels,
        },
      },
    })
  }

  private async _upsertTaskLabels(
    taskId: number,
    labelsToKeep?: string[] | null,
  ) {
    if (!labelsToKeep || labelsToKeep.length === 0) {
      // remove all
      await this._prisma.taskLabel.deleteMany({
        where: {
          taskId,
        },
      })

      return
    }

    // resolve  label ids
    let labels: Label[] = []
    labels = await this._prisma.label.findMany({
      where: {
        name: {
          in: labelsToKeep,
        },
      },
    })

    // labels that not exist, create
    const existedLabels = labels.map((lbl) => lbl.name)
    const newLabels = labelsToKeep.filter((lbl) => !existedLabels.includes(lbl))

    if (newLabels.length > 0) {
      // upsert and fetch labels
      const newCreatedLabelIds = await this._upsertLabels(newLabels)

      labels.push(...newCreatedLabelIds)
    }

    // remove only those no longer related
    await this._prisma.taskLabel.deleteMany({
      where: {
        taskId,
        labelId: {
          notIn: labels.map((label) => label.id),
        },
      },
    })

    // insert new task labels
    await this._prisma.taskLabel.createMany({
      data: labels.map((label) => ({
        labelId: label.id,
        taskId: taskId,
      })),
      skipDuplicates: true,
    })
  }

  private async _upsertAssignees(taskId: number, assignees?: number[] | null) {
    if (!assignees || assignees.length === 0) {
      // remove all
      await this._prisma.assignee.deleteMany({
        where: {
          taskId,
        },
      })

      return
    }

    // validate assignees are valid users
    if (assignees.length > 0 && !(await this._isValidUsers(assignees)))
      throw new BadRequestException(`invalid assignee`)

    // remove those no longer related
    await this._prisma.assignee.deleteMany({
      where: {
        taskId,
        userId: {
          notIn: assignees,
        },
      },
    })

    // insert new assignee
    await this._prisma.assignee.createMany({
      data: assignees.map((assigneeId) => ({
        taskId,
        userId: assigneeId,
      })),
      skipDuplicates: true,
    })
  }
}
