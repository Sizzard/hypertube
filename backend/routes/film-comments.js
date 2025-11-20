export default async function filmComments(fastify, opts) {
    fastify.get("/film-comments", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const imdb_id = request.query.imdb_id
            
            if (!imdb_id) {
                throw new Error("BAD_REQUEST");
            }

            console.log("IMDB_ID = ", imdb_id);

            // downloadSubtitles(imdb_id);

            // downloadTorrent(imdb_id);
           
            return reply.send({message: "Torrent added successfully"});
        }
        catch (err) {
            console.log("ERROR DOWNLOAD TORRENT:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}