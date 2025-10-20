import verifyJWT from "./verifyJWT.js";

export default async function movieDetails(fastify, opts) {
    fastify.get("/movie-details", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const id = request.query.id
            if (!id) {
                throw new Error("BAD_REQUEST");
            }
            console.log("MOVIE ID:", id);
            const fetchQuery = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
                });
            const response = await fetchQuery.json();
            console.log(response);
            return reply.send(response);
        }
        catch (err) {
            console.log("ERROR REQUEST TITLE:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}