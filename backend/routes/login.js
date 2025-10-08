import bcrypt from "bcrypt";

export default async function signupRoutes(fastify, opts) {
    const pool = opts.pool;
    fastify.post("/login", async (request, reply) => {
        try {
            const { email, password } = request.body;

            if (!email || !password) {
                return reply.code(400).send({error : "MISSING_FIELDS"});
            }

            const existingEmail = await pool.query(
                `SELECT id FROM users WHERE email = $1`,
                [email]
            );

            if (existingEmail.rows.length === 0) {
                return reply.code(401).send({error: "WRONG_CREDS"});
            }
            const result = await pool.query(
                `SELECT password FROM users WHERE email = $1`,
                [email]
            );
            const storedHash = result.rows[0].password;
            const match = await bcrypt.compare(password, storedHash);
            if (!match) {
                return reply.code(401).send({error: "WRONG_CREDS"});
            }
            return reply.code(201).send({message: "CONNECTED"});
        } catch (err) {
            fastify.log.error(err);
            return reply.code(400).send({error: "INTERNAL_ERROR"});
        }
    });
}