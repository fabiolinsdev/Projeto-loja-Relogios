import Fastify from 'fastify';
import { productsRoutes } from './routes/products';
import { usersRoutes } from './routes/users';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors'
import { ordersRoutes } from './routes/orders';

const app = Fastify({

});

app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
});

app.get('/', async () => {
  return {
    message: 'API da loja de relógios funcionando',
  };
});

app.register(ordersRoutes);
app.register(productsRoutes);
app.register(usersRoutes);

app.listen({
  port: 3333,
  host: '0.0.0.0',
})
  .then(() => {
    console.log('Servidor rodando na porta 3333');
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });