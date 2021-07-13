const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedat,
  updatedat
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: insertedat,
  updatedAt: updatedat
})

module.exports = { mapDBToModel }
