import jwt from "jsonwebtoken";
import verifyJWT from "./verifyJWT.js";

export default async function comments(fastify, opts) {
    const pool = opts.pool;
    fastify.get("/comments", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
	    const user_id = request.user.id;
	    if (!user_id) {
            	return reply.code(400).send({ error: "BAD_REQUEST" });
	    }

            const imdb_id = request.query.imdb_id;
	    if (!imdb_id) {
            	return reply.code(400).send({ error: "BAD_REQUEST" });
	    }

            const result = await pool.query('SELECT * from comments WHERE id = $1',
                [imdb_id],
            );
	    console.log(result.rows);

            reply.send(result.rows[0]);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });
