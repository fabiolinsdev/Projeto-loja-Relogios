import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: './dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const category = await prisma.category.findUnique({
    where: {
      name: 'Casual',
    },
  });

  if (!category) {
    throw new Error('Categoria Casual não encontrada.');
  }

  const product = await prisma.product.create({
    data: {
      name: 'Casio Vintage',
      description: 'Relógio digital clássico com design retrô.',
      price: 249.90,
      stock: 10,
      categoryId: category.id,
    },
  });

  console.log('Produto criado:', product);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  