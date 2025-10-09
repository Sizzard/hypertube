import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
            const user = await pool.query(
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );
            const storedHash = user.rows[0].password;
            const match = await bcrypt.compare(password, storedHash);
            if (!match) {
                return reply.code(401).send({error: "WRONG_CREDS"});
            }

            const token = jwt.sign(
                {
                    id: user.rows[0].id,
                    email: user.rows[0].email,
                    username: user.rows[0].username,
                },
                process.env.JWT_SECRET,
                {expiresIn: "12h"}
            );

            return reply.code(201).send({message: "CONNECTED", token});
        } catch (err) {
            fastify.log.error(err);
            return reply.code(400).send({error: "INTERNAL_ERROR"});
        }
    });
}