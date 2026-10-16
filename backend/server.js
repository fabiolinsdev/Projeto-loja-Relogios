const fastify = require('fastify')({ 
    logger: true 
});

fastify.get('/', async () => { 
    return {
        message: 'API da loja de relogio funcionando'
    }
})

const start = async () => {
    try {
        // PORTA recebe a variável do servidor (process.env.PORT) ou 3000 como padrão local
        await fastify.listen({ 
            port: Number(process.env.PORT) || 3000, 
            host: '0.0.0.0' 
        }) 
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
        }   
}

start()