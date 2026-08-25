import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { createUserSchema, loginUserSchema } from '../schemas/user';

export async function usersRoutes(app: FastifyInstance) {
    app.post('/users', async (request, reply) => {
        const data = createUserSchema.parse(request.body);

        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (existingUser) {
            return reply.status(409).send({
                message: 'E-mail já cadastrado',
            });
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: passwordHash,
            },
        });

        return reply.status(201).send({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    });

    app.post('/login', async (request, reply) => {
        const data = loginUserSchema.parse(request.body);

        const user = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            return reply.status(401).send({
                message: 'E-mail ou senha inválidos',
            });
        }

        const passwordMatch = await bcrypt.compare(
            data.password,
            user.password
        );

        if (!passwordMatch) {
            return reply.status(401).send({
                message: 'E-mail ou senha inválidos',
            });
        }

        const token = await app.jwt.sign({
            id: user.id,
            email: user.email,
        });

        return reply.send({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    });
}