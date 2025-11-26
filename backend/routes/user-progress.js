import verifyJWT from "./verifyJWT.js";

export default async function userProgress(fastify, opts) {
    const pool = opts.pool;
    fastify.get("/user-progress", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const { imdb_id, position } = request.body.imdb_id;
            const user_id = request.user.id;
            if (!imdb_id || !user_id || !position) {
                return reply.code(400).send({ error: "BAD_REQUEST" });
            }

            console.log(`IMDB_ID = ${imdb_id}, user_id ${user_id}`);

            const result = await pool.query(`SELECT 
                comments.id,
                comments.user_id,
                comments.imdb_id,
                comments.content,
                comments.created_at,
                users.username
                FROM comments
                JOIN users ON users.id = comments.user_id
                WHERE comments.imdb_id = $1
                ORDER BY comments.created_at DESC`,
                [imdb_id],
            );
            console.log(result.rows);

            reply.send(result.rows);
            
        } catch (err) {
            console.log("ERROR GET USER PROGRESS:", err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });

    fastify.post("/user-progress", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const { imdb_id, position } = request.body.imdb_id;
            const user_id = request.user.id;
            console.log(`IMDB_ID = ${imdb_id}, user_id = ${user_id}, position = ${position}`);
            if (!imdb_id || !user_id || !position) {
                return reply.code(400).send({ error: "BAD_REQUEST" });
            }

            const result = await pool.query(`INSERT INTO user_progress (user_id, imdb_id, position)
                                                VALUES ($1, $2, $3)
                                                ON CONFLICT (user_id, imdb_id)
                                                DO UPDATE SET position = $3, updated_at = CURRENT_TIMESTAMP
                                                RETURNING *`,
                                            [user_id, imdb_id, position]);

            console.log(result.rows[0]);

            reply.send(result.rows[0]);
            
        } catch (err) {
            console.log("ERROR POST USER PROGRESS:", err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });
}
