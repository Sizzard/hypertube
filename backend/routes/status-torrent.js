import verifyJWT from "./verifyJWT.js";
import qbit from "../utils/qbtFetch.js";

export default async function statusTorrent(fastify, opts) {
    fastify.get("/status-torrent", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const imdb_id = request.query.imdb_id
            if (!imdb_id) {
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

            const matches = infoTorrents.filter(t => t.category === imdb_id);

            if (matches.length === 0) {
                throw new Error("BAD_REQUEST");
            }

            console.log("imdb_id match : ", matches[0]);

            const files = await qbit.qbtFetch(`/api/v2/torrents/files?hash=${matches[0].hash}`, {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            });

            if (!files.ok) {
                throw new Error("Failed to check torrent state");
            }

            const supportedFileFormat = [".mp4", ".mkv"];

            console.log(files);

            const filesTree = await files.json();

            // console.log("File tree : ", filesTree);

            const fileMatch = filesTree.filter(t => 
                supportedFileFormat.some( ext => t.name.endsWith(ext)));

            if (!fileMatch) {
                throw new Error("BAD_REQUEST");
            }

            const response = {
                progress: matches[0].progress,
                filePath: fileMatch[0].name
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