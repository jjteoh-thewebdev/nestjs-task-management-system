import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()

  console.log('Seeding...')

  const result = await prisma.user.createMany({
    data: [
      { username: 'user1' },
      { username: 'user2' },
      { username: 'user3' },
      { username: 'user4' },
      { username: 'user5' },
    ],
  })

  console.log(`seed ${result.count} users`)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
