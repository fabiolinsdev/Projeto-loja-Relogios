import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { createProductSchema, updateProductSchema, } from '../schemas/product';
import { authenticate } from '../auth';

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

    app.put(
        '/products/:id',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };

            const result = updateProductSchema.safeParse(request.body);

            if (!result.success) {
                return reply.status(400).send({
                    message: 'Dados inválidos',
                    errors: result.error.issues,
                });
            }

            const product = await prisma.product.findUnique({
                where: {
                    id,
                },
            });

            if (!product) {
                return reply.status(404).send({
                    message: 'Produto não encontrado',
                });
            }

            const updatedProduct = await prisma.product.update({
                where: {
                    id,
                },
                data: result.data,
                include: {
                    category: true,
                },
            });

            return reply.status(200).send(updatedProduct);
        });

    app.delete(
        '/products/:id',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };

            const product = await prisma.product.findUnique({
                where: {
                    id,
                },
            });

            if (!product) {
                return reply.status(404).send({
                    message: 'Produto não encontrado',
                });
            }

            await prisma.product.delete({
                where: {
                    id,
                },
            });

            return reply.status(204).send();
        });

    app.post(
        '/products',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
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