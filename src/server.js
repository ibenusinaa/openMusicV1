require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const path = require('path')
const Inert = require('@hapi/inert')

const songs = require('./api/openMusic')
const OpenMusicService = require('./services/postgres/openMusicService')
const SongsValidator = require('./validator/openMusic')

// users
const users = require('./api/users')
const UsersService = require('./services/postgres/usersService')
const UsersValidator = require('./validator/users')

// authentications
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/authenticationsService')
const AuthenticationsValidator = require('./validator/authentications')
const TokenManager = require('./tokenize/TokenManager')

// playlists
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/playlistsService')
const PlaylistsValidator = require('./validator/playlists')

// collab
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/collaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

// exports
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitMQ/producerService')
const ExportsValidator = require('./validator/exports')

// uploads
const uploads = require('./api/uploads')
const StorageService = require('./services/storage/storageService')
const UploadsValidator = require('./validator/uploads')

// cacheService
const CacheService = require('./services/redis/cacheService')


const init = async () => {
  const cacheService = new CacheService()
  const openMusicService = new OpenMusicService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService(cacheService)
  const playlistsService = new PlaylistsService(collaborationsService, cacheService)
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: songs,
      options: {
        service: openMusicService,
        validator: SongsValidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        openMusicService,
        validator: PlaylistsValidator
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator
      }
    },
    {
      plugin: _exports,
      options: {
        ProducerService,
        playlistsService,
        validator: ExportsValidator
      }
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator
      }
    }
  ])

  await server.start()
  console.log(`API running on PORT ${server.info.uri}`)
}

init()
