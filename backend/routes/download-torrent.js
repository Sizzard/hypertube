import verifyJWT from "./verifyJWT.js";

export default async function downloadTorrent(fastify, opts) {
    fastify.get("/download-torrent", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const magnet = request.query.magnet
            if (!magnet) {
                throw new Error("BAD_REQUEST");
            }
            const loginRes = await fetch("http://qbittorrent:8080/api/v2/auth/login", {
                method: "POST",
                headers: { "Content-type" : "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: "admin",
                    password: "adminadmin",
                }),
            });

            if (!loginRes.ok) {
                throw new Error("Login Failed");
            }
            console.log(loginRes);
            const cookie = loginRes.headers.get("set-cookie");
            
            if(!cookie) {
                throw new Error("No auth cookie received");
            }

            const dlRes = await fetch("http://qbittorrent:8080/api/v2/torrents/add", {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    cookie,
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