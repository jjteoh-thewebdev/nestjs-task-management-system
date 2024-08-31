// this file return mocked prisma client
// for unit test use
// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing

import { PrismaClient } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { PrismaService } from './prisma.service'
import prisma from './prisma.client'

jest.mock('./prisma.client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>
export const mockedPrismaService = mockedPrisma as unknown as PrismaService &
  DeepMockProxy<PrismaClient>
