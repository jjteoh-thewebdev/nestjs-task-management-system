import { Task, TaskStatus } from '@prisma/client'

export const tasksFixtures: Task[] = [
  {
    id: 1,
    title: `title1`,
    description: `description1`,
    dueDate: new Date(),
    priority: 1,
    storyPoint: null,
    status: TaskStatus.OPEN,
    createdById: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 2,
    title: `title2`,
    description: `description2`,
    dueDate: new Date(),
    priority: 2,
    storyPoint: null,
    status: TaskStatus.OPEN,
    createdById: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 3,
    title: `title3`,
    description: `description3`,
    dueDate: new Date(),
    priority: null,
    storyPoint: null,
    status: TaskStatus.OPEN,
    createdById: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
]
