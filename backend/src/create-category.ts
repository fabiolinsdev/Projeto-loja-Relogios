import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: './dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const category = await prisma.category.create({
    data: {
      name: 'Casual',
    },
  });

  console.log('Categoria criada:', category);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });