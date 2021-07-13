const InvariantError = require('../../exceptions/InvariantError')
const { openMusicSchema } = require('./schema')

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = openMusicSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = SongsValidator
