export default async function linkAccount(fastify, opts) {
    const pool = opts.pool;
    fastify.post("/link-account", async (request, reply) => {
        const { email, provider, oauth_id} = request.body;
        try {
            const result = await pool.query(
                "UPDATE users SET oauth_provider = $1, oauth_id = $2 WHERE email = $3 RETURNING id",
                [provider, oauth_id, email]
            );
            if (result.rowCount === 0) {
                return reply.code(404).send({error: "USER_NOT_FOUND"});
            }
            return reply.send({success: true});
        }
        catch(err) {
            console.log("ERROR in LINK ACCOUNT:", err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });
}