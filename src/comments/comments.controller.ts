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
  Patch,
  Post,
  Put,
  Query,
  Scope,
  UseInterceptors,
} from '@nestjs/common'
import { CommentDiKeys } from './constants/di'
import { ICommentService } from './comment.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { QueryCommentsDto } from './dto/query-comments.dto'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { ReplaceCommentDto } from './dto/replace-comment.dto'

@Controller({
  path: `comments`,
  version: `1`,
  scope: Scope.REQUEST,
})
export class CommentsController {
  constructor(
    @Inject(CommentDiKeys.COMMENT_SERVICE)
    private readonly _commentService: ICommentService,
  ) {}

  // GET /v1/comments/:id
  @Get(`:id`)
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param(`id`) id: number) {
    if (isNaN(id)) {
      throw new NotFoundException()
    }

    const comment = await this._commentService.findOne(id)
    if (!comment) {
      throw new NotFoundException()
    }

    return comment
  }

  // GET /v1/comments
  @Get()
  @UseInterceptors(CacheInterceptor)
  async find(@Query() dto: QueryCommentsDto) {
    return await this._commentService.findMany(dto)
  }

  // POST /v1/comments
  @Post()
  async create(@Body() dto: CreateCommentDto) {
    return await this._commentService.create(dto)
  }

  // PUT /v1/comments/:id
  @Put(`:id`)
  async replaceOne(@Param(`id`) id: number, @Body() dto: ReplaceCommentDto) {
    return await this._commentService.updateOne(id, dto)
  }

  // PATCH /v1/comments/:id
  @Patch(`:id`)
  async UpdateOne(@Param(`id`) id: number, @Body() dto: UpdateCommentDto) {
    return await this._commentService.updateOne(id, dto)
  }

  // DELETE /v1/comments/:id
  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(@Param(`id`) id: number) {
    return await this._commentService.deleteOne(id)
  }
}
