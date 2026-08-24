import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { createProductSchema } from '../schemas/product';

export async function productsRoutes(app: FastifyInstance) {
  app.get('/products', async () => {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    return products;
  });

  app.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return reply.status(404).send({
        message: 'Produto não encontrado',
      });
    }

    return product;
  });

    app.post('/products', async (request, reply) => {
    const result = createProductSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: result.error.issues,
      });
    }

    const product = await prisma.product.create({
      data: result.data,
      include: {
        category: true,
      },
    });

    return reply.status(201).send(product);
  });
}