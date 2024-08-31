import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { TaskDiKeys } from './constants/di'
import { TaskService } from './task.service'

@Module({
  providers: [
    {
      provide: TaskDiKeys.TASK_SERVICE,
      useClass: TaskService,
    },
  ],
  controllers: [TasksController],
})
export class TaskModule {}
