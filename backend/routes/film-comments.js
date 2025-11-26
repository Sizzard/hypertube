import verifyJWT from "./verifyJWT.js";

export default async function comments(fastify, opts) {
    const pool = opts.pool;
    fastify.get("/comments", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const comment_id = request.query.id;
            // if (!comment_id) {
            //         return reply.code(400).send({ error: "BAD_REQUEST" });
            // }

            const imdb_id = request.query.imdb_id;
            if (!imdb_id) {
                    return reply.code(400).send({ error: "BAD_REQUEST" });
            }

            // console.log(`IMDB_ID = ${imdb_id}, comment_id = ${comment_id}`);

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
            // console.log(result.rows);

            reply.send(result.rows);
            
        } catch (err) {
            console.log("ERROR GET COMMENTS FILMS:", err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });

    fastify.post("/comments", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const { imdb_id, content, comment_id } = request.body;
            const user_id = request.user.id;
            // console.log(`IMDB_ID = ${imdb_id}, user_id ${user_id}, content = ${content}, comment_id = ${comment_id}`);
            if (!user_id || !imdb_id || !content || content.length > 200) {
                return reply.code(400).send({ error: "BAD_REQUEST" });
            }
            // console.log(`POST COMMENTS`);

            const insertRes = await pool.query(`INSERT INTO comments (user_id, imdb_id, content)
                                                VALUES ($1, $2, $3)
                                                RETURNING *`,
                                            [user_id, imdb_id, content]);

            // console.log(insertRes.rows[0]);

            reply.send(insertRes.rows[0]);
            
        } catch (err) {
            console.log("ERROR POST COMMENTS FILMS:", err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });
}
