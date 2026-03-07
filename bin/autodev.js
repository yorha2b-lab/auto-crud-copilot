#!/usr/bin/env node
const path = require('path')

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
})

const { program } = require('commander')
const watchApi = require('../src/commands/watch-api')
const watchPage = require('../src/commands/watch-page')
const watchPart = require('../src/commands/watch-part')

program.version('1.0.0').description('AI驱动的前端CRUD代码生成器')

program.option('-t, --template <type>', '指定前端框架模板', 'react')

program
    .command('watch:page')
    .description('监听截图，自动生成完整的增删改查页面')
    .action(() => watchPage(program.opts()))

program
    .command('watch:part')
    .description('监听截图，自动生成局部 UI 组件')
    .action(() => watchPart(program.opts()))

program
    .command('watch:api')
    .description('监听 Swagger，自动对齐真实接口字段')
    .action(() => watchApi())

program.parse(process.argv)