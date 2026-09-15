import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authenticate } from '../auth';

export async function ordersRoutes(app: FastifyInstance) {
    app.post(
        '/orders',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const { items } = request.body as {
                items: {
                    productId: string;
                    quantity: number;
                }[];
            };

            if (!items || items.length === 0) {
                return reply.status(400).send({
                    message: 'O pedido precisa ter pelo menos um produto',
                });
            }

            const productIds = items.map((item) => item.productId);

            const products = await prisma.product.findMany({
                where: {
                    id: {
                        in: productIds,
                    },
                },
            });

            if (products.length !== items.length) {
                return reply.status(400).send({
                    message: 'Um ou mais produtos não foram encontrados',
                });
            }

            let total = 0;

            const orderItems = items.map((item) => {
                const product = products.find(
                    (product) => product.id === item.productId
                );

                if (!product) {
                    throw new Error('Produto não encontrado');
                }

                if (item.quantity <= 0) {
                    throw new Error('Quantidade inválida');
                }

                if (item.quantity > product.stock) {
                    throw new Error(
                        `Estoque insuficiente para o produto ${product.name}`
                    );
                }

                total += product.price * item.quantity;

                return {
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                };
            });

            const order = await prisma.order.create({
                data: {
                    userId: request.user.id,
                    total,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            for (const item of orderItems) {
                await prisma.product.update({
                    where: {
                        id: item.productId,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            return reply.status(201).send(order);
        }
    );
}