export default async function callback(fastify, opts) {
    fastify.get("/callback", async (request, reply) => {
        const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token",
            method: "POST"
        )
    });
}