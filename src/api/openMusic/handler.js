const ClientError = require('../../exceptions/ClientError')

class OpenMusicHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.addSongHandler = this.addSongHandler.bind(this)
    this.getSongsHandler = this.getSongsHandler.bind(this)
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this)
    this.editSongByIdHandler = this.editSongByIdHandler.bind(this)
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this)
  }

  async addSongHandler (request, h) {
    try {
      this._validator.validateSongPayload(request.payload)
      const { title, year, performer, genre, duration } = request.payload

      const songId = await this._service.addSong({ title, year, performer, genre, duration })

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data: {
          songId: songId
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
      console.log(error)
      const response = h.response({
        status: 'fail',
        message: 'Maaf terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async getSongsHandler () {
    const songs = await this._service.getSongs()
    return {
      status: 'success',
      data: {
        songs: songs
      }
    }
  }

  async getSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      const song = await this._service.getSongById(id)
      return {
        status: 'success',
        data: {
          song: song
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
        message: 'Maaf terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async editSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      const { title, year, performer, genre, duration } = request.payload
      await this._service.editSongById(id, { title, year, performer, genre, duration })

      return {
        status: 'success',
        message: 'lagu berhasil diperbarui'
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
        message: 'Maaf terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async deleteSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteSongById(id)

      return {
        status: 'success',
        message: 'lagu berhasil dihapus'
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
        message: 'Maaf terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }
}

module.exports = OpenMusicHandler
