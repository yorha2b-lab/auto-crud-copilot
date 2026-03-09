#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')

console.log(chalk.cyan(figlet.textSync('AutoDev', { horizontalLayout: 'full' })))
console.log(chalk.gray('--------------------------------------------------'))
console.log(chalk.white(' [System] ') + chalk.green('YoRHa No.2 Type B Unit: ') + chalk.cyan('Online'))
console.log(chalk.white(' [Mission] ') + chalk.yellow('Generate Frontend CRUD: ') + chalk.cyan('Awaiting Command'))
console.log(chalk.gray('--------------------------------------------------\n'))

const localEnv = path.resolve(process.cwd(), '.env')
const pkgEnv = path.resolve(__dirname, '../.env')

require("dotenv").config({
    path: fs.existsSync(localEnv) ? localEnv : pkgEnv
})

const { program } = require('commander')
const watchApi = require('../src/commands/watch-api')
const watchPage = require('../src/commands/watch-page')
const watchPart = require('../src/commands/watch-part')

program.version('1.0.0').description('AI驱动的前端CRUD代码生成器')

program.option('-t, --template <type>', '指定前端框架模板', 'react')

program
    .command('init')
    .description('在当前目录初始化 .env 和 config.js 配置文件')
    .action(() => {
        const tplConfig = path.resolve(__dirname, '../config.js')
        const tplEnv = path.resolve(__dirname, '../.env.example')
        fs.copyFileSync(tplConfig, path.join(process.cwd(), 'config.js'))
        fs.copyFileSync(tplEnv, path.join(process.cwd(), '.env'))
        console.log('✅ 已生成 config.js')
        console.log('✅ 已生成 .env')
    })

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