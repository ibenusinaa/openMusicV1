const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthrozationError')

class PlaylistsService {
  constructor (collaborationService, cacheService) {
    this._pool = new Pool()
    this._collaborationService = collaborationService
    this._cacheService = cacheService
  }

  async createPlaylist (name, owner) {
    const id = `playlist-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) throw new InvariantError('Playlist gagal dibuat')

    
    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: `SELECT a.id, a.name, users.username 
      FROM (SELECT playlists.* FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id) a LEFT JOIN users ON users.id = a.owner`,
      values: [owner]
    }

    const result = await this._pool.query(query)

    
    return result.rows
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
  }

  async verifyPlaylistOwner (playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)
    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan')

    const playlist = result.rows[0]
    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
  }

  async addSongToPlaylist (playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id, playlist_id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)
    if (!result.rows.length) throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist')
    const { playlist_id } = result.rows[0]
    await this._cacheService.delete(`songlist-playlist${playlist_id}`)
  }

  async getSongsOnPlaylist (playlistId) {
    const query = {
      text: 'SELECT songs.id, title, performer from playlistsongs JOIN songs ON songs.id = playlistsongs.song_id WHERE playlist_id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) throw NotFoundError('Tidak tedapat lagu pada playlist ini')

    await this._cacheService.set(`songlist-playlist${playlistId}`, JSON.stringify(result.rows))
    return result.rows
  }

  async deleteSongFromPlaylist (playlistId, songId) {
    const query = {
      text: 'DELETE from playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id, playlist_id',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) throw new InvariantError('Lagu gagal dihapus playlist tidak ditemukan')
    const { playlist_id } = result.rows[0]
    await this._cacheService.delete(`songlist-playlist${playlist_id}`)
  }

  async verifySongId (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) throw new InvariantError('Lagu tidak ditemukan')
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      await this._collaborationService.verifyCollaborator(playlistId, userId)
        .catch((err) => { throw err })
    }
  }
}

module.exports = PlaylistsService
