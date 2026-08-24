import {z} from 'zod';  
import {createProductSchema} from './product';


export const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(0),
    stock: z.number().min(0),
    categoryId: z.string().min(1),
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

export type CreateProductInput = z.infer<typeof createProductSchema>;