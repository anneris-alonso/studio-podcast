import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const migrationName = "20260217000000_init"
  const migrationPath = `prisma/migrations/${migrationName}/migration.sql`
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`)
    return
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  // Prisma checksum is SHA256 of the SQL content
  const checksum = crypto.createHash('sha256').update(sql).digest('hex')

  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (
        id, 
        checksum, 
        finished_at, 
        migration_name, 
        logs, 
        rolled_back_at, 
        started_at, 
        applied_steps_count
      ) VALUES (
        $1, $2, NOW(), $3, NULL, NULL, NOW(), 1
      )
    `, migrationName, checksum, migrationName)
    console.log("Successfully baselined.")
  } catch (e) {
    console.error("Failed to insert migration:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
