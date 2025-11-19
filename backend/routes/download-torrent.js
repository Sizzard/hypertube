import verifyJWT from "./verifyJWT.js";
import qbit from "../utils/qbtFetch.js";
import sub from "../utils/openSubFetch.js";

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

function getBestEnglishSubtitle(subs) {
  const enSubs = subs.filter((s) => s.attributes.language === "en");
  if (!enSubs.length) return null;

  return enSubs.reduce((prev, curr) =>
    curr.attributes.download_count > prev.attributes.download_count ? curr : prev
  );
}

async function downloadAndConvertSrt(srtUrl, outputPath) {
  const res = await fetch(srtUrl);
  if (!res.ok) throw new Error("Failed to download SRT");

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync("/tmp/temp.srt", buffer);

  fs.createReadStream("/tmp/temp.srt")
    .pipe(srt2vtt())
    .pipe(fs.createWriteStream(outputPath));

  console.log("Subtitle converted to VTT:", outputPath);
}

export async function downloadSubtitles(imdb_id, outputPath) {
  try {
    const res = await sub.openSubFetch(`?imdb_id=${imdb_id}`);
    const data = await res.json();

    const bestSub = getBestEnglishSubtitle(data.data);
    if (!bestSub) {
      console.log("Aucun sous-titre EN trouvé");
      return;
    }

    console.log("BestSub:", bestSub.attributes);

    const downloadRes = await sub.openSubFetch(`/${bestSub.attributes.subtitle_id}/download`);
    const downloadData = await downloadRes.json();
    console.log("SUB", downloadData);
    const srtUrl = downloadData.link;
    if (!srtUrl) throw new Error("SRT download link missing");

    await downloadAndConvertSrt(srtUrl, outputPath);
  } catch (err) {
    console.error("Error downloading subtitles:", err);
  }
}

export default async function downloadTorrent(fastify, opts) {
    fastify.get("/download-torrent", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const imdb_id = request.query.imdb_id
            
            if (!imdb_id) {
                throw new Error("BAD_REQUEST");
            }

            console.log("IMDB_ID = ", imdb_id);

            downloadSubtitles(imdb_id, "./downloads/en.vtt");

            const ytsRes = await fetch(`https://yts.lt/api/v2/movie_details.json?imdb_id=${imdb_id}`);

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
                    category: imdb_id,
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