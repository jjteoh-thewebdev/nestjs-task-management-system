import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Comment } from '@prisma/client'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { PrismaService } from '../prisma/prisma.service'
import { QueryCommentsDto } from './dto/query-comments.dto'
import { PaginatedResult } from '../common/models/paginated-result'

export interface ICommentService {
  findOne(id: number): Promise<Comment | null>
  findMany(dto: QueryCommentsDto): Promise<PaginatedResult<Comment>>
  create(dto: CreateCommentDto): Promise<Comment>
  replaceOne(id: number, dto: UpdateCommentDto): Promise<Comment>
  deleteOne(id: number): Promise<void>
}

@Injectable()
export class CommentService implements ICommentService {
  constructor(private readonly _prisma: PrismaService) {}

  async findOne(id: number): Promise<Comment | null> {
    return await this._prisma.comment.findUnique({
      where: { id, deletedAt: null },
      include: { user: true },
    })
  }

  async findMany(dto: QueryCommentsDto): Promise<PaginatedResult<Comment>> {
    const { pagination, sort, filters } = dto

    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 10
    let where = { deletedAt: null }

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
    const comments = await this._prisma.comment.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { user: true },
    })

    // compute count
    const totalComments = await this._prisma.comment.count({ where })

    return {
      data: comments,
      pagination: {
        total: totalComments,
        pageCount: Math.ceil(totalComments / pageSize),
        page: page,
        pageSize: pageSize,
      },
    }
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    // validate task exist
    if (!(await this._isValidTask(dto.taskId))) {
      throw new BadRequestException(`invalid taskId`)
    }

    // validate user exist
    if (!(await this._isValidUser(dto.userId))) {
      throw new BadRequestException(`invalid userId`)
    }

    return await this._prisma.comment.create({
      data: {
        content: dto.content,
        user: {
          connect: {
            id: dto.userId,
          },
        },
        task: {
          connect: {
            id: dto.taskId,
          },
        },
      },
      include: { user: true },
    })
  }

  async replaceOne(id: number, dto: UpdateCommentDto): Promise<Comment> {
    // if not exist, don't proceed
    if (!(await this._prisma.comment.count({ where: { id } }))) {
      throw new NotFoundException()
    }

    // validate task exist
    if (!(await this._isValidTask(dto.taskId))) {
      throw new BadRequestException(`invalid taskId`)
    }

    // validate user exist
    if (!(await this._isValidUser(dto.userId))) {
      throw new BadRequestException(`invalid userId`)
    }

    return await this._prisma.comment.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        content: dto.content,
        user: {
          connect: {
            id: dto.userId,
          },
        },
        task: {
          connect: {
            id: dto.taskId,
          },
        },
      },
      include: { user: true },
    })
  }

  async deleteOne(id: number): Promise<void> {
    // if not exist, just skip
    if (!(await this._prisma.comment.count({ where: { id } }))) {
      return
    }

    await this._prisma.comment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  private async _isValidUser(id: number): Promise<boolean> {
    return (await this._prisma.user.count({ where: { id } })) > 0
  }

  private async _isValidTask(id: number): Promise<boolean> {
    return (await this._prisma.task.count({ where: { id } })) > 0
  }
}
