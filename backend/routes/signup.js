export default async function signupRoutes(fastify, opts) {
    fastify.post("/signup", async (request, reply) => {
        try {
            const { username, firstName, lastName, email, password } = request.body;

            if (!username || !firstName || !lastName || !email || !password) {
                return reply.code(400).send({error : "Missing fields"});
            }

            console.log("New User:", {username, email});
            return reply.code(201).send({message: "User created successfully"});
        } catch (err) {
            fastify.log.error(err);
            return reply.code(501).send({error: "Internal server error"});
        }
    });
}