const routes = require('./routes')
const ExportsHandler = require('./handler')

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { ProducerService, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(ProducerService, playlistsService, validator)
    server.route(routes(exportsHandler))
  }
}
