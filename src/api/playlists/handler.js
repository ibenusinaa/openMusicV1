const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
  constructor (playlistsService, openMusicService, validator) {
    this._playlistsService = playlistsService
    this._openMusicService = openMusicService
    this._validator = validator

    this.postCreatePlaylistHandler = this.postCreatePlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
    this.addSongToPlaylistHandler = this.addSongToPlaylistHandler.bind(this)
    this.getSongsOnPlaylistHandler = this.getSongsOnPlaylistHandler.bind(this)
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this)
  }

  async postCreatePlaylistHandler (request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload)

      const { name } = request.payload
      const { id: credentialId } = request.auth.credentials
      const playlistId = await this._playlistsService.createPlaylist(name, credentialId)

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async getPlaylistsHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._playlistsService.getPlaylists(credentialId)
    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistByIdHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
      await this._playlistsService.deletePlaylistById(playlistId)

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async addSongToPlaylistHandler (request, h) {
    try {
      this._validator.validateAddSongToPlaylistPayload(request.payload)
      const { playlistId } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
      await this._openMusicService.getSongById(songId)
      await this._playlistsService.addSongToPlaylist(playlistId, songId)

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist'
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async getSongsOnPlaylistHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
      const songs = await this._playlistsService.getSongsOnPlaylist(playlistId)

      return {
        status: 'success',
        data: {
          songs
        }
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async deleteSongFromPlaylistHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
      await this._playlistsService.verifySongId(songId)
      await this._playlistsService.deleteSongFromPlaylist(playlistId, songId)

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }
}

module.exports = PlaylistsHandler
