import verifyJWT from "./verifyJWT.js";
import qbit from "../utils/qbtFetch.js";

import fs from "fs";
import path from "path";

async function downloadTorrentFile(url) {
  try {
    let fileName = path.basename(url);
    if (!fileName.endsWith(".torrent")) {
      fileName += ".torrent";
    }
    const downloadPath = path.join(process.cwd(), "downloads", "torrents", fileName);

    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur téléchargement : ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());

    fs.writeFileSync(downloadPath, buffer);

    console.log(`Fichier téléchargé : ${downloadPath}`);
    return downloadPath;
  } catch (err) {
    console.error("ERROR downloadTorrentFile:", err);
    throw err;
  }
}

export default async function downloadTorrent(fastify, opts) {
    fastify.get("/download-torrent", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const imdb_id = request.query.imdb_id
            
            if (!imdb_id) {
                throw new Error("BAD_REQUEST");
            }

            // console.log("IMDB_ID = ", imdb_id);

            const ytsRes = await fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb_id}`);

            // console.log(ytsRes);

            const ytsInfo = await ytsRes.json();

            if (!ytsInfo || !ytsInfo.data.movie.torrents) {
                throw new Error("NO_INFO");
            }

            // console.log("YTS INFO : ", ytsInfo);
            // console.log("TORRENTS INFO : ", ytsInfo.data.movie.torrents);

            const match1080p = ytsInfo.data.movie.torrents.find(t => t.quality === '1080p' && t.peers > 0);

            // console.log("MATCH 1080p :", match1080p);

            const result = {
                has1080pAvailable: !!match1080p, 
                url: match1080p?.url || null   
            };

            if (result.has1080pAvailable === false) {
                throw new Error("NO_PEERS");
            }
            // console.log("RESULTS :", result);

            const dlRes = await qbit.qbtFetch("/api/v2/torrents/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    urls: result.url, // URL direct du .torrent
                    savepath: "/downloads",
                    sequentialDownload: "true",
                    paused: "false",
                }),
            });


            if (!dlRes.ok) {
                throw new Error("Failed to dl torrent");
            }

            console.log("Torrent added successfully : ", await dlRes.text());
            return reply.send({message: "Torrent added successfully"});
        }
        catch (err) {
            console.log("ERROR DOWNLOAD TORRENT:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}