import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const sql = fs.readFileSync('step55_final.sql', 'utf16le') // Or check encoding
  // Let's try to read it as-is and split by semicolons if needed, 
  // but $executeRawUnsafe might support multiple statements depending on driver.
  // Actually, better to run it in chunks or use a tool that handles SQL files.
  
  // Actually, I'll just try to write a clean UTF-8 file first.
  const content = fs.readFileSync('step55_final.sql', 'utf16le').replace(/^\uFEFF/, '')
  fs.writeFileSync('step55_clean.sql', content, 'utf8')
  console.log("Cleaned SQL file.")
}

main()
