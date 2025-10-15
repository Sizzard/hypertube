import jwt from "jsonwebtoken";
import verifyJWT from "./verifyJWT.js";

export default async function profile(fastify, opts) {
    const pool = opts.pool;
    fastify.get("/private-profile", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const userId = request.user.id;
            const result = await pool.query('SELECT username, first_name, last_name, email FROM users WHERE id = $1',
                [userId],
            );
            reply.send(result.rows[0]);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });
    fastify.get("/public-profile/:username", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const { username } = request.params;
            if (!username) {
                return reply.code(400).send({error: "BAD_REQUEST"});
            }
            const result = await pool.query(
                "SELECT username, first_name, last_name, avatar_filename FROM users WHERE username=$1",
                [username],
            );
            console.log("USERNAME:", username);
            console.log("RESULT:", result);
            console.log("RESULT LEN :", result.rows.length);

            if (result.rows.length === 0) {
                throw new Error("USER_DOES_NOT_EXIST");
            }
            const user = result.rows[0];
            const avatarUrl = user.avatar_filename
                ? `http://localhost:3030/uploads/${user.avatar_filename}`
                : "/default.jpg";

            return reply.send({
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar_url: avatarUrl,
            });
        } catch(err) {
            console.log("ERROR GET PULBIC PROFILE:", err);
            if (err.message === "USER_DOES_NOT_EXIST") {
            return reply.code(400).send({error: "USER_DOES_NOT_EXIST"});
            }
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
    fastify.put('/private-profile', {preHandler: [verifyJWT]}, async (request,reply) => {
        try {
            const { username, first_name, last_name, email } = request.body;
            const userId = request.user.id;
            const self = await pool.query(
                "SELECT id, username, email FROM users WHERE id=$1",
                [userId],
            );
            if (!username || !first_name || !last_name || !email) {
                return reply.code(400).send({error: "BAD_REQUEST"}); 
            }
            const existingUsername = await pool.query(
                `SELECT id, username FROM users WHERE username = $1`,
                [username]
            );
            const existingMail = await pool.query(
                `SELECT id, email, oauth_provider FROM users WHERE email = $1`,
                [email]
            );
            if (existingUsername.rows.length > 0 && existingUsername.rows[0].username != self.rows[0].username) {
                return reply.code(409).send({error: "USER_EXISTS"});
            }
            if (existingMail.rows.length > 0 && existingMail.rows[0].email != self.rows[0].email) {
                return reply.code(409).send({error: "EMAIL_EXISTS"});
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