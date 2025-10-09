export default async function ping(fastify, opts) {
    fastify.get("/ping", async (request, reply) => {
        return reply.code(200).send({message: "PONG"});
    });
}