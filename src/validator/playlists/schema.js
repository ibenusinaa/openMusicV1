const Joi = require('joi')

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required()
})

const AddSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required()
})

module.exports = {
  PostPlaylistPayloadSchema,
  AddSongToPlaylistPayloadSchema
}