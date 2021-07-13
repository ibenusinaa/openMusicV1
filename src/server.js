require('dotenv').config()
const Hapi = require('@hapi/hapi')
const songs = require('./api/openMusic')
const OpenMusicService = require('./services/postgres/openMusicService')
const SongsValidator = require('./validator/openMusic')

const init = async () => {
  const openMusicService = new OpenMusicService()
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register({
    plugin: songs,
    options: {
      service: openMusicService,
      validator: SongsValidator
    }
  })

  await server.start()
  console.log(`API running on PORT ${server.info.uri}`)
}

init()
