import Fastify from 'fastify'
import cors from "@fastify/cors"
import SignupRoute from './routes/signup.js';
import LoginRoute from './routes/login.js';
import VerifyRoute from './routes/verify-token.js';
import Callback42 from './routes/callback_42.js';
import CallbackGithub from './routes/callback_github.js';
import LinkAccount from './routes/link-account.js';
import forgotPassword from './routes/forgot-password.js';
import resetPassword from './routes/reset-password.js';
import Ping from './routes/ping.js'
import pkg from "pg";
const { Pool } = pkg;

const fastify = Fastify({
  logger: true
})

await fastify.register(cors, { origin: '*'});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

await fastify.register(Ping);
await fastify.register(forgotPassword, {prefix : "/api", pool})
await fastify.register(resetPassword, {prefix : "/api", pool})
await fastify.register(VerifyRoute, {prefix : "/api", pool})
await fastify.register(SignupRoute, {prefix: "/api", pool});
await fastify.register(LoginRoute, {prefix: "/api", pool});
await fastify.register(LinkAccount, {prefix: "/auth/", pool});
await fastify.register(Callback42, {prefix: "/auth/42", pool});
await fastify.register(CallbackGithub, {prefix: "/auth/github", pool});

const start = async () => {
  try {
    await fastify.listen({ port: 3030, host: '0.0.0.0' })
    console.log('Server running at http://0.0.0.0:3030')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
