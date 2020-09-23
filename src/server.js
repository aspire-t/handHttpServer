const Server = require('./application')

// 创建服务的
function createServer(defaultConfig) {
  let { port, directory, address } = defaultConfig
  // 创建http服务
  // 异步功能 async + await 所有的方法更好管理一些
  let server = new Server({
    port,
    directory,
    address,
  }) // 工厂模式
  return server
}

module.exports = createServer
