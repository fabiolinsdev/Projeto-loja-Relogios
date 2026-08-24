import Fastify from 'fastify';
import { productsRoutes } from './routes/products';

const app = Fastify({
  logger: true,
});

app.get('/', async () => {
  return {
    message: 'API da loja de relógios funcionando',
  };
});

app.register(productsRoutes);

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