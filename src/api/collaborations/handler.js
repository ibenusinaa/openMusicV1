const ClientError = require('../../exceptions/ClientError')

class CollaborationsHandler {
  constructor (collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService
    this._playlistsService = playlistsService
    this._validator = validator

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this)
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this)
  }

  async postCollaborationHandler (request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload)

      const { id: credentialId } = request.auth.credentials
      const { playlistId, userId } = request.payload

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
      const collabId = await this._collaborationsService.addCollaboration(playlistId, userId)

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collabId
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
        message: 'Maaf terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async deleteCollaborationHandler (request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload)

      const { id: credentialId } = request.auth.credentials
      const { playlistId, userId } = request.payload

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
      await this._collaborationsService.deleteCollaboration(playlistId, userId)

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus'
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

module.exports = CollaborationsHandler
