#! /usr/bin/env node

// const { program } = require('commander')
// console.log('test')

// 可执行文件一般会增加命令行参数解析 process.argv

// 可以使用commander  来解析用户的参数
// @babel/node  可以使用es6语法

const program = require('commander')
const packageJson = require('../package.json')
// console.log(packageJson)
program.version(packageJson.version) // 显示版本号  提供 --version命令
program.parse(process.argv) // 解析用户输入的参数
