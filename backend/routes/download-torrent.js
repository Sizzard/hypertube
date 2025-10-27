import verifyJWT from "./verifyJWT.js";
import qbit from "../utils/qbtFetch.js";

export default async function downloadTorrent(fastify, opts) {
    fastify.get("/download-torrent", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const magnet = request.query.magnet
            if (!magnet) {
                throw new Error("BAD_REQUEST");
            }

            const dlRes = await qbit.qbtFetch("/api/v2/torrents/add", {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    urls: magnet,
                    savepath: "/downloads",
                    sequentialDownload: "true",
                    paused: "false",
                }),
            });

            if (!dlRes.ok) {
                throw new Error("Failed to dl torrent");
            }

            console.log("Torrent added successfully");
            return reply.send({message: "Torrent added successfully"});
        }
        catch (err) {
            console.log("ERROR DOWNLOAD TORRENT:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}