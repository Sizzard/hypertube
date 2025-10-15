import jwt from "jsonwebtoken"

export default async function verifyJWT(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            console.log("COULD NOT VERIFY JWT");
            return reply.code(401).send({error: "unauthorized"});
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        request.user = decoded;
    }
    catch(err) {
        console.log("COULD NOT VERIFY JWT");
        return reply.code(401).send({error: "unauthorized"});
    }
}