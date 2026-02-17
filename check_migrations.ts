import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const migrations = await prisma.$queryRawUnsafe(`SELECT * FROM "_prisma_migrations"`)
    console.log(JSON.stringify(migrations, null, 2))
  } catch (e) {
    console.log("Error or table does not exist")
  } finally {
    await prisma.$disconnect()
  }
}

main()
