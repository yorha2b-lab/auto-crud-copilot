#!/usr/bin/env node
/**
 * Auto CRUD Copilot - AI驱动的前端CRUD代码生成器
 *
 * 这是一个基于视觉大模型的前端全自动CRUD代码生成工具，支持：
 * 1. 通过截图自动生成完整的增删改查页面
 * 2. 通过截图自动生成局部UI组件
 * 3. 通过Swagger文档自动对齐前后端字段
 *
 * @author yorha2b
 * @version 1.0.0
 */

const path = require('path')

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
})

const { program } = require('commander')
const watchApi = require('../src/commands/watch-api')
const watchPage = require('../src/commands/watch-page')
const watchPart = require('../src/commands/watch-part')

// 设置CLI程序基本信息
program.version('1.0.0').description('AI驱动的前端CRUD代码生成器')

// 添加全局选项：指定前端框架模板
program.option('-t, --template <type>', '指定前端框架模板', 'react')

// 添加watch:page命令：监听截图，自动生成完整的增删改查页面
program
    .command('watch:page')
    .description('监听截图，自动生成完整的增删改查页面')
    .action(() => watchPage(program.opts()))

// 添加watch:part命令：监听截图，自动生成局部UI组件
program
    .command('watch:part')
    .description('监听截图，自动生成局部 UI 组件')
    .action(() => watchPart(program.opts()))

// 添加watch:api命令：监听Swagger，自动对齐真实接口字段
program
    .command('watch:api')
    .description('监听 Swagger，自动对齐真实接口字段')
    .action(() => watchApi())

// 解析命令行参数并执行相应命令
program.parse(process.argv)