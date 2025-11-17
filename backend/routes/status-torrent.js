import verifyJWT from "./verifyJWT.js";
import qbit from "../utils/qbtFetch.js";

export default async function statusTorrent(fastify, opts) {
    fastify.get("/status-torrent", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const hash = request.query.hash
            if (!hash) {
                throw new Error("BAD_REQUEST");
            }

            console.log("Requesting info torrents");

            const dlRes = await qbit.qbtFetch(`/api/v2/torrents/info`, {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            });

            if (!dlRes.ok) {
                throw new Error("Failed to dl torrent");
            }

            const infoTorrents = await dlRes.json();

            console.log("Received : ", infoTorrents);

            const matches = infoTorrents.filter(t =>t.hash.includes(hash));

            if (!matches) {
                throw new Error("BAD_REQUEST");
            }

            console.log("json : ", matches[0]);

            const response = {
                progress: matches[0].progress,
                filePath: matches[0].content_path
            };

            console.log("response :", JSON.stringify(response, null, 2));

            return reply.send(response);
        }
        catch (err) {
            console.log("ERROR STATUS TORRENT:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}