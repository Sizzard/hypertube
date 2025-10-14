import crypto from "crypto";
import nodemailer from "nodemailer";

export default async function forgotPassword(fastify, opts) {
    const pool = opts.pool;
    fastify.post("/forgot-password", async (request, reply) => {
        try{
            const { email } = request.body;
            const userRes = await pool.query(
                "SELECT id FROM users WHERE email=$1",
                [email],
            );
            if (userRes.rows.length === 0) {
                return reply.code(200).send({ message: "If that email exists, a reset link has been sent." });
            }
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 3600 * 1000); // 1h

            await pool.query(
                "UPDATE users SET reset_password_token=$1, reset_password_expires=$2 WHERE email=$3",
                [token, expires, email]
            );
            console.log(
                "\nSMTP_HOST:", process.env.SMTP_HOST,
                "\nSMTP_PORT:", process.env.SMTP_PORT,
                "\nSMTP_USER:", process.env.SMTP_USER,
                "\nSMTP_PASS:", process.env.SMTP_PASS
            )
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS},
            });

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await transporter.sendMail({
                from: `"Support ${process.env.SMTP_USER}`,
                to: email,
                subject: "Password Reset",
                html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
            });
            return reply.send({ message: "If that email exists, a reset link has been sent." });
        } catch(err) {
            console.log("ERROR FORGOT PASSWORD:", err);
            return reply.code(400).send({ error: "BAD_REQUEST" });
        }
    });
}