export default function Signup(fastify, opts) {
    fastify.post("/api/signup", async (request, reply) => {
        try {
            const { username, firstName, lastName, email, password } = request.body;

            if (!username || !firstName || !lastName || !email || !password) {
                
            }
        }
    });
}