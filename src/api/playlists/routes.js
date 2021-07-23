const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postCreatePlaylistHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.addSongToPlaylistHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getSongsOnPlaylistHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deleteSongFromPlaylistHandler,
    options: {
      auth: 'openmusic_jwt'
    }
  }
]

module.exports = routes
