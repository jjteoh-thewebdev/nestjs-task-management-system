import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Label, Task, TaskStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { QueryTasksDto } from './dto/query-tasks.dto'
import { PaginatedResult } from '../common/models/paginated-result'

export interface ITaskService {
  findOne(id: number): Promise<Task | null>
  findMany(dto: QueryTasksDto): Promise<PaginatedResult<Task>>
  create(dto: CreateTaskDto): Promise<Task>
  replaceOne(id: number, dto: UpdateTaskDto): Promise<Task>
  deleteOne(id: number): Promise<void>
}

const outputSignature = {
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
}

@Injectable()
export class TaskService implements ITaskService {
  constructor(private readonly _prisma: PrismaService) {}

  async findOne(id: number): Promise<Task | null> {
    return await this._prisma.task.findUnique({
      where: { id, deletedAt: null },
      include: outputSignature,
    })
  }

  async findMany(dto: QueryTasksDto = {}): Promise<PaginatedResult<Task>> {
    const { pagination, sort, filters } = dto

    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 10
    let where = {
      deletedAt: null,
    }

    if (filters) {
      where = {
        ...where,
        ...filters,
      }
    }

    const orderBy: { [key: string]: 'asc' | 'desc' }[] =
      sort?.map((s) => {
        const str = s.split(`:`)
        const ordering: 'asc' | 'desc' =
          str[1] && [`asc`, `desc`].includes(str[1].toLowerCase())
            ? (str[1] as 'asc' | 'desc')
            : `asc`

        return {
          [str[0]]: ordering,
        }
      }) || []
    const skip = page ? (page - 1) * pageSize : 0
    const take = pageSize

    // fetch data
    const tasks = await this._prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      include: outputSignature,
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
        await this._prisma.label.createMany({
          data: dto.labels.map((label) => ({
            name: label,
          })),

          skipDuplicates: true,
        })

        labels = await this._prisma.label.findMany({
          where: {
            name: {
              in: dto.labels,
            },
          },
        })
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
        include: outputSignature,
      })
    })
  }

  async replaceOne(id: number, dto: UpdateTaskDto): Promise<Task> {
    // if not exist, don't proceed
    if (!(await this._prisma.task.count({ where: { id } }))) {
      throw new NotFoundException()
    }

    // validate createdBy is valid
    if (!(await this._isValidUsers([dto.createdBy]))) {
      throw new BadRequestException(`createdBy must be a valid user`)
    }

    // validate assignees are valid
    if (dto.assignees && !(await this._isValidUsers(dto.assignees))) {
      throw new BadRequestException(`invalid assignee`)
    }

    return await this._prisma.$transaction(async () => {
      let labels: Label[]
      if (dto.labels && dto.labels.length > 0) {
        await this._prisma.label.createMany({
          data: dto.labels.map((label) => ({
            name: label,
          })),

          skipDuplicates: true,
        })

        labels = await this._prisma.label.findMany({
          where: {
            name: {
              in: dto.labels,
            },
          },
        })

        // remove those no longer related
        await this._prisma.taskLabel.deleteMany({
          where: {
            taskId: id,
            labelId: {
              notIn: labels.map((label) => label.id),
            },
          },
        })

        await this._prisma.taskLabel.createMany({
          data: labels.map((label) => ({
            labelId: label.id,
            taskId: id,
          })),

          skipDuplicates: true,
        })
      } else {
        // remove all
        await this._prisma.taskLabel.deleteMany({
          where: {
            taskId: id,
          },
        })
      }

      if (dto.assignees && dto.assignees.length > 0) {
        // remove those no longer related
        await this._prisma.assignee.deleteMany({
          where: {
            taskId: id,
            userId: {
              notIn: dto.assignees,
            },
          },
        })

        // insert new assignee
        await this._prisma.assignee.createMany({
          data: dto.assignees.map((assigneeId) => ({
            taskId: id,
            userId: assigneeId,
          })),
          skipDuplicates: true,
        })
      } else {
        // remove all
        await this._prisma.assignee.deleteMany({
          where: {
            taskId: id,
          },
        })
      }

      return await this._prisma.task.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          title: dto.title,
          description: dto.description,
          dueDate: dto.dueDate,
          priority: dto.priority,
          storyPoint: dto.storyPoint,
          status: dto.status || TaskStatus.OPEN,
          createdById: dto.createdBy,
          // TODO: nested write(upsert) not working....
        },
        include: outputSignature,
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
}
