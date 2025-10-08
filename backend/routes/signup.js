import bcrypt from "bcrypt";

export default async function signupRoutes(fastify, opts) {
    const pool = opts.pool;
    fastify.post("/signup", async (request, reply) => {
        try {
            const { username, firstName, lastName, email, password } = request.body;

            if (!username || !firstName || !lastName || !email || !password) {
                return reply.code(400).send({error : "MISSING_FIELDS"});
            }

            const existingUsername = await pool.query(
                `SELECT id FROM users WHERE username = $1`,
                [username]
            );
            const existingEmail = await pool.query(
                `SELECT id FROM users WHERE email = $1`,
                [email]
            );
            if (existingUsername.rows.length > 0) {
                return reply.code(409).send({error: "USER_EXISTS"});
            }
            if (existingEmail.rows.length > 0) {
                return reply.code(409).send({error: "EMAIL_EXISTS"});
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const result = await pool.query(
                `INSERT INTO users (username, first_name, last_name, email, password) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
                [username, firstName, lastName, email, hashedPassword]
            );
            // console.log(`Password in db : ${hashedPassword}`);
            return reply.code(201).send({message: "USER_CREATED"});
        } catch (err) {
            fastify.log.error(err);
            return reply.code(400).send({error: "INTERNAL_ERROR"});
        }
    });
}