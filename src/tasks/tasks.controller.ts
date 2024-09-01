import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Scope,
  UseInterceptors,
} from '@nestjs/common'
import { ITaskService } from './task.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskDiKeys } from './constants/di'
import { QueryTasksDto } from './dto/query-tasks.dto'
import { CacheInterceptor } from '@nestjs/cache-manager'

@Controller({
  path: `tasks`,
  version: `1`,
  scope: Scope.REQUEST,
})
export class TasksController {
  constructor(
    @Inject(TaskDiKeys.TASK_SERVICE)
    private readonly _taskService: ITaskService,
  ) {}

  // GET /v1/tasks/:id
  @Get(`:id`)
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param(`id`) id: number) {
    if (isNaN(id)) {
      throw new NotFoundException()
    }

    const task = await this._taskService.findOne(id)
    if (!task) {
      throw new NotFoundException()
    }

    return task
  }

  // GET /v1/tasks
  @Get()
  @UseInterceptors(CacheInterceptor)
  async find(@Query() dto: QueryTasksDto) {
    return await this._taskService.findMany(dto)
  }

  // POST /v1/tasks
  @Post()
  async create(@Body() dto: CreateTaskDto) {
    return await this._taskService.create(dto)
  }

  // PUT /v1/tasks/:id
  @Put(`:id`)
  async updateOne(@Param(`id`) id: number, @Body() dto: UpdateTaskDto) {
    return await this._taskService.replaceOne(id, dto)
  }

  // DELETE /v1/tasks/:id
  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(@Param(`id`) id: number) {
    return await this._taskService.deleteOne(id)
  }
}
