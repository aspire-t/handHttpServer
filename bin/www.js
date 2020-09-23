#! /usr/bin/env node

// const { program } = require('commander')
// console.log('test')

// 可执行文件一般会增加命令行参数解析 process.argv

// 可以使用commander  来解析用户的参数
// @babel/node  可以使用es6语法

const program = require('commander')
const packageJson = require('../package.json')
const userOptions = require('./config')

const usages = []
// console.log(packageJson)
Object.values(userOptions).forEach((option) => {
  usages.push(option.usage) // 存储使用用例
  program.option(option.option, option.description)
})

// 修改Usage，修改usage的使用
program.name('hand-http-server')
program.usage('--option <value>')

program.version(packageJson.version) // 显示版本号  提供 --version命令

// 监听用户输入的参数 --help
program.on('--help', () => {
  // 追加使用项
  console.log(`Usages:\r`)
  usages.forEach((usage) => {
    console.log(`  ` + usage)
  })
})

const userConfig = program.parse(process.argv) // 解析用户输入的参数
const defaultConfig = {
  port: 8080,
  address: 'localhost',
  directory: process.cwd(), // 获取当前的路径
  ...userConfig,
}
console.log(defaultConfig)
// 只要写一个第三方命令行模块 都要做的事情。。。

// 1.启动一个服务
let createServer = require('../src/server')
let server = createServer(defaultConfig)
server.start() // 开启服务
