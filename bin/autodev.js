#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')
const { program } = require('commander')

console.log(chalk.cyan(figlet.textSync('AutoDev', { horizontalLayout: 'full' })))
console.log(chalk.gray('Booting System...'))
console.log(chalk.white(' [System] ') + chalk.green('YoRHa No.2 Type B Unit: ') + chalk.cyan('Online'))
console.log(chalk.white(' [System] ') + chalk.green('Scanner Type 9S Unit: ') + chalk.cyan('Standby'))
console.log(chalk.white(' [Mission] ') + chalk.yellow('Frontend Architecture Construction: ') + chalk.cyan('Awaiting Command'))
console.log(chalk.white(' [Bunker] ') + chalk.magenta('Glory to mankind. (人类荣光永存)'))
console.log(chalk.gray('--------------------------------------------------\n'))

program.version('1.0.0').description('AI驱动的前端CRUD代码生成器')
program.option('-t, --template <type>', '指定前端框架模板', 'react')

program
    .command('init')
    .description('在当前目录初始化 .env 和 config.js 配置文件')
    .action(() => {
        const tplConfig = path.resolve(__dirname, '../config.js')
        const tplEnv = path.resolve(__dirname, '../.env.example')
        fs.copyFileSync(tplEnv, path.join(process.cwd(), '.env'))
        fs.copyFileSync(tplConfig, path.join(process.cwd(), 'config.js'))
        fs.mkdirSync(path.join(process.cwd(), 'swagger'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenShot'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenPart'), { recursive: true })
        console.log(chalk.cyan('📡 Operator 6O: 呼叫 2B，环境配置文件已下发至本地终端！'))
        console.log(chalk.green('🤖 Pod 042: [报告] config.js 与 .env 存储完毕。'))
    })

program
    .command('watch:page')
    .description('监听截图，自动生成完整的增删改查页面')
    .action(() => {
        const watchPage = require('../src/commands/watch-page')
        watchPage(program.opts())
    })

program
    .command('watch:part')
    .description('监听截图，自动生成局部 UI 组件')
    .action(() => {
        const watchPart = require('../src/commands/watch-part')
        watchPart(program.opts())
    })

program
    .command('watch:api')
    .description('监听 Swagger，自动对齐真实接口字段')
    .action(() => {
        const watchApi = require('../src/commands/watch-api')
        watchApi()
    })

program.parse(process.argv)