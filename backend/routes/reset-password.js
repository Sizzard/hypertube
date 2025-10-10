export default async function resetPassword(fastify, opts) {
    const pool = opts.pool;
    fastify.post("/reset-password", async (request, reply) => {
        try{
            const { token, newPassword } = request.body;

            const res = await pool.query(
                "SELECT id, reset_password_expires FROM users WHERE reset_password_token=$1",
                [token],
            );
            if (res.row.length ===0 || res.rows[0].reset_password_expires < new Date()) {
                return reply.code(400).send({error: "Invalid or expired token"});
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await pool.query(
                "UPDATE users SET password=$1, reset_password_token=NULL, reset_password_expires=NULL WEHRE id=$2",
                [hashedPassword, res.rows[0].id],
            );

            return reply.send({message: "password successfully reset"});
        } catch(err) {
            console.log("ERROR RESET PASSWORD:", err);
            return reply.code(500).send({error: "INTERNAL_SERVER_ERROR"});
        }
    });
}