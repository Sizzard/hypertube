
export default function (fastify, opts) {
    fastify.get('/api/hello', async(request, reply) => {
    return { message:"Hello from fastify  👋 "};
    });

    fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
    })
}