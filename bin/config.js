const options = {
  port: {
    // 可以定义端口号
    option: '-p, --port <v>',
    description: 'Port to use [8080]',
    usage: 'zs --port 3000',
  },
  address: {
    option: '-a,--address <v>',
    description: 'Address to use [0.0.0.0]',
    usage: 'zs -a 127.0.0.1',
  },
  directory: {
    option: '-d,--directory <v>',
    description: 'Show directory listings [true]',
    usage: 'zs -d D:',
  },
}
module.exports = options
