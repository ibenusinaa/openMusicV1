const {
  PostPlaylistPayloadSchema,
  AddSongToPlaylistPayloadSchema
} = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const playlistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload)
    if(validationResult.error) throw new InvariantError(validationResult.error.message)
  },
  validateAddSongToPlaylistPayload: (payload) => {
    const validationResult = AddSongToPlaylistPayloadSchema.validate(payload)
    if(validationResult.error) throw new InvariantError(validationResult.error.message)
  }
}

module.exports = playlistsValidator
