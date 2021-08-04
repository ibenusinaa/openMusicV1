const ClientError = require('../../exceptions/ClientError')

class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this._producerService = ProducerService
    this._playlistsService = playlistsService
    this._validator = validator

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this)
  }

  async postExportPlaylistHandler(request, h) {
    try {
      const { playlistId } = request.params
      const { id: credentialId } = request.auth.credentials
      await this._validator.validateExportPlaylistPayload(request.payload)
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)

      const message = {
        userId: request.auth.credentials.id,
        targetEmail: request.payload.targetEmail
      }

      await this._producerService.sendMessage('export:playlist', JSON.stringify(message))
      const response = h.response({
        status: 'success',
        message: 'Permintaan anda sedang dalam antrean'
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
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = ExportsHandler
