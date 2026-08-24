const fastify = require('fastify')
({ logger: true 

});

fastify.get('/', async () => { 
return {
        message: 'API da loja de relogio funcionando'
    }
})

const start = async () => {
    try {
        await fastify.listen({ port: 3000,}) 
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }   

}

start()