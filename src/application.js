// 服务核心
const http = require('http')
const fs = require('fs').promises
const url = require('url')
const path = require('path')
const crypto = require('crypto')
const zlib = require('zlib')
// -----  第三方模块
const mime = require('mime')
const ejs = require('ejs')
const chalk = require('chalk')
const { createReadStream, readFileSync, readdir } = require('fs')
const template = readFileSync(path.join(__dirname, 'template.html'), 'utf8')

class Server {
  constructor(options) {
    this.port = options.port
    this.directory = options.directory
    this.address = options.address
    this.template = template
  }
  // 处理请求
  async handleRequest(req, res) {
    // this指向的问题 箭头函数 或者bind都可以改变this指向
    // 你请求我 我需要获得你请求的路径 通过路径返回你对应的内容
    // 静态服务
    let { pathname } = url.parse(req.url)
    pathname = decodeURIComponent(pathname)
    let filePath = path.join(this.directory, pathname)

    //  可能用户请求的是文件 也有可能请求的是个目录
    try {
      let statObj = await fs.stat(filePath)
      if (statObj.isFile()) {
        // 文件， 读取文件 返回对应的文件
        this.handleFile(filePath, req, res, statObj)
      } else {
        // 文件夹 将文件夹的目录列出来返还回去
        // 文件夹 需要目录下的内容全部读取出来 返回回去
        let dirs = await fs.readdir(filePath)
        let renderTemplate = await ejs.render(
          template,
          { dirs },
          { async: true }
        )
        res.end(renderTemplate)

        // 讲下header的应用 压缩 206 换错 多语言 跨域 代理...
      }
    } catch (e) {
      this.handleError(e, req, res)
    }
  }

  md5(val) {
    return crypto.createHash('md5').update(val).digest('base64')
  }

  async cache(req, res, filePath, statObj) {
    res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toGMTString())
    res.setHeader('Cache-Control', 'max-age=10')
    let lastModified = statObj.ctime.toGMTString()
    let content = await fs.readFile(filePath) // 粗略的计算一下
    let Etag = this.md5(content)
    res.setHeader('Last-Modified', lastModified)
    res.setHeader('Etag', Etag)

    // 获取浏览的header
    let ifModifiedSince = req.headers['if-modified-since']
    let ifNoneMatch = req.headers['if-none-match']
    if (ifModifiedSince !== lastModified) {
      //  最后修改时间正常
      return false
    }
    if (Etag !== ifNoneMatch) {
      // 文件内容一样
      return false
    }
    return true // 有缓存
  }

  gzip(req, res, filePath, statObj) {
    // generator + co
    // content-encoding
    let encoding = req.headers['accept-encoding']
    if (encoding && encoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip') //浏览器看到这个标识会自动解压缩
      return zlib.createGzip()
    } else {
      return false
    }
  }

  async handleFile(filePath, req, res, statObj) {
    // node中都是utf8的，浏览器不知道是什么编码 gbk
    // 通过头的方式来告诉浏览器我的文件的类型
    let cache = await this.cache(req, res, filePath, statObj)
    if (cache) {
      res.statusCode = 304 // 走缓存
      return res.end()
    }
    // 如果没有缓存 就返回文件 （压缩）
    let gzip = await this.gzip(req, res, filePath, statObj)
    res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')
    if (gzip) {
      // 支持gzip 就返回压缩流
      createReadStream(filePath).pipe(gzip).pipe(res)
    } else {
      createReadStream(filePath).pipe(res)
    }
  }

  handleError(err, req, res) {
    console.log(err)
    res.statusCode = 404
    res.end('Not Found')
  }
  // 启动服务
  start() {
    // http.createServer 默认这个方法中的回调的this指代的是createServer的返回值
    let server = http.createServer(this.handleRequest.bind(this))
    server.listen(this.port, this.address, () => {
      console.log(`${chalk.yellow('Starting up zf-hot-server, serving ./')}`)
      console.log(`  http://${this.address}:${chalk.green(this.port)}`)
    })
  }
}
module.exports = Server
// 1） http的header 有哪些 都是干嘛的
// http2 针对某个域名限制 ie6 2 6个请求
