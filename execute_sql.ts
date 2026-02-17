import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const sql = fs.readFileSync('step55_clean.sql', 'utf8')
  // Simple semicolon split - might be brittle for complex SQL but let's try
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
  
  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 50)}...`)
    try {
      await prisma.$executeRawUnsafe(statement)
      console.log("Success")
    } catch (e: any) {
      console.error(`FAILED: ${e.message}`)
      // Decide whether to continue or stop
    }
  }
}

main().finally(() => prisma.$disconnect())
