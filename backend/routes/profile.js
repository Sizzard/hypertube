import jwt from "jsonwebtoken";
import verifyJWT from "./verifyJWT.js";

export default async function profile(fastify, opts) {
    const pool = opts.pool;
    fastify.get("/profile", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const userId = request.user.id;
            const result = await pool.query('SELECT username, first_name, last_name, email FROM users WHERE id = $1',
                [userId],
            );
            reply.send(result.rows[0]);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({error: "INTERNAL_ERROR"});
        }
    });
    fastify.put('/profile', {preHandler: [verifyJWT]}, async (request,reply) => {
        try {
            const { username, first_name, last_name, email } = request.body;
            const userId = request.user.id;
            if (!username || !first_name || !last_name || !email) {
                return reply.code(400).send({error: "BAD_REQUEST"}); 
            }
            const existingUsername = await pool.query(
                `SELECT id, email FROM users WHERE username = $1`,
                [username]
            );
            const existingMail = await pool.query(
                `SELECT id, email, oauth_provider FROM users WHERE email = $1`,
                [email]
            );
            if (existingUsername.rows.length > 0 ) {
                return reply.code(409).send("USER_EXISTS");
            }
            if (existingMail.rows.length > 0) {
                return reply.code(409).send("EMAIL_EXISTS");
            }
            const result = await pool.query(
                "UPDATE users SET username=$1, first_name=$2, last_name=$3, email=$4 WHERE id = $5 RETURNING username, first_name, last_name, email",
                [username, first_name, last_name, email, userId],
            );
            return reply.send(result.rows[0]);
        } catch(err) {
            fastify.log.error(err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}