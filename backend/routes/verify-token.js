import jwt from "jsonwebtoken";

export default async function verifyToken(fastify, opts) {
    fastify.get("/verify-token", async (request, reply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                // console.log("No token");
                return reply.code(403).send({error: "No token"});
            }
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                // console.log("Invalid token");
                return reply.code(403).send({error: "Invalid token"}); 
            }
            // console.log("token valid:", decoded);
            return reply.code(200).send({ ok: true});
        } catch (err) {
            // console.log("Invalid or expired token:", err);
            return reply.code(403).send({error: "Invalid or expired token"});
        }
    });
}