import multer from "fastify-multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import verifyJWT from "./verifyJWT.js";
import { request } from "http";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

export default async function avatarUpload(fastify, opts) {
    const pool = opts.pool;
    fastify.addContentTypeParser(
        "multipart/form-data",
        (request, payload, done) => done()
    );
    const storage = multer.diskStorage({
        destination: (request, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (request, file, cb) => {
            const ext = path.extname(file.originalname);
            const randomName = crypto.randomUUID() + ext;
            cb(null, randomName);
        },
    });

    const fileFilter = (request, file , cb) => {
        if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("INVALID_FILE_TYPE"), false);
        }
    };

    const upload = multer({
        storage,
        fileFilter,
        limits: {fileSize: 2 * 1024 * 1024},
    });

    fastify.post("/upload",  {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            await new Promise((resolve, reject) => {
                upload.single("avatar")(request, reply.raw, (err) => {
                    if (err) {
                        return reject(err);
                    };
                    resolve();
                });
            });

            if (!request.file) {
                return reply.code(400).send({error: "NO_FILE"});
            }
            console.log("FILE RECEIVED:", request.file);
            await pool.query(
                "UPDATE users SET avatar_filename=$1 WHERE id=$2",
                [request.file.filename, request.user.id],
            );
            reply.send({ok: true});
        }catch(err) {
            return reply.code(400).send({error: err.code});
        }
    });
    fastify.get("/:username", async (request, reply) => {
        try {
            const { username } = request.params;
            if (!username) {
                throw new Error("USERNAME_REQUIRED");
            }
            const user = await pool.query(
                "SELECT avatar_filename FROM users WHERE username = $1",
                [username]
            );

            console.log("GET AVATAR, SENDING IMAGE OF : ", username);

            const avatarUrl = `http://localhost:3030/uploads/${user.rows[0].avatar_filename || "default.jpg"}`;

            console.log("avatarUrl:", avatarUrl);
            return reply.send({avatar_url: avatarUrl});

        } catch(err) {
            if (err.message === "USERNAME_REQUIRED") {
            return reply.code(400).send({error: err.message});
            }
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
        
    });
}