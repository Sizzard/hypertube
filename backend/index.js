import Fastify from 'fastify'
import helloRoutes from './routes/hello.js'
import cors from "@fastify/cors"
import SignupRoute from './routes/signup.js';

const fastify = Fastify({
  logger: true
})

await fastify.register(cors, { origin: '*'});

await fastify.register(helloRoutes);
await fastify.register(SignupRoute);

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
