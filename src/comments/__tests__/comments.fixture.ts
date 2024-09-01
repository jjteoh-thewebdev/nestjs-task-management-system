import { Comment } from '@prisma/client'

export const commentFixtures: Comment[] = [
  {
    id: 1,
    userId: 1,
    taskId: 1,
    content: `comment1`,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 2,
    userId: 2,
    taskId: 1,
    content: `comment2`,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 3,
    userId: 1,
    taskId: 2,
    content: `comment3`,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
]
