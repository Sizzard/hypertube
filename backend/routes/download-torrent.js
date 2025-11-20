import verifyJWT from "./verifyJWT.js";
import qbit from "../utils/qbtFetch.js";
import sub from "../utils/openSubFetch.js";

import fs from "fs";
import path from "path";

function getBestEnglishSubtitle(subs) {
  return subs.reduce((prev, curr) =>
    curr.attributes.download_count > prev.attributes.download_count ? curr : prev
  );
}

function srtToVtt(srtContent) {
  const vttContent =
    "WEBVTT\n\n" +
    srtContent
      .replace(/(\d+):(\d+):(\d+),(\d+)/g, "$1:$2:$3.$4")
      .replace(/^\d+\s*$/gm, '')
      .replace(/\n{3,}/g, "\n\n");

  return vttContent.trim();
}

async function downloadAndConvertSrt(srtUrl, imdb_id) {

  const basePath = "/downloads";

  const imdbDir = path.join(basePath, imdb_id);
  
  if (!fs.existsSync(imdbDir)) {
    console.log(`Le dossier ${imdbDir} n'existe pas, création...`);
    fs.mkdirSync(imdbDir);
  }

  const outputPath = path.join(imdbDir, "en.vtt");

  const res = await fetch(srtUrl);
  if (!res.ok) throw new Error("Failed to download SRT");

  const buffer = Buffer.from(await res.arrayBuffer());
  const srtContent = buffer.toString("utf8");
  const vttContent = srtToVtt(srtContent);

  fs.writeFileSync(outputPath, vttContent, "utf8");

  console.log("Subtitle saved as VTT:", outputPath);
}

export async function downloadSubtitles(imdb_id) {
  try {
    const res = await sub.openSubFetch(`/subtitles?imdb_id=${imdb_id}&languages=en`);
    const data = await res.json();

    const bestSub = getBestEnglishSubtitle(data.data);
    if (!bestSub) {
      console.log("Aucun sous-titre EN trouvé");
      return;
    }

    console.log("BestSub.attributes :", bestSub.attributes);
    console.log("BestSub.attributes.files :", bestSub.attributes.files);
    console.log("bestSub.attributes.files[0].file_id :", bestSub.attributes.files[0].file_id);

    const downloadRes = await sub.openSubFetch(`/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: bestSub.attributes.files[0].file_id,
        }),
    });
    const downloadData = await downloadRes.json();

    console.log("downloadData : ", downloadData);
    console.log("downloadData.link : ", downloadData.link);
    const srtUrl = downloadData.link;
    if (!srtUrl) throw new Error("SRT download link missing");

    await downloadAndConvertSrt(srtUrl, imdb_id);
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

            downloadSubtitles(imdb_id);

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