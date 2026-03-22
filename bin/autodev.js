#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')
const { program } = require('commander')
const pkg = require(path.join(__dirname, '../package.json'))
const { language } = require(path.join(__dirname, '../src/utils/utils.js'))

console.log(chalk.cyan(figlet.textSync('AutoDev', { horizontalLayout: 'full' })))
console.log(chalk.gray('Booting System...'))
console.log(chalk.white(' [System] ') + chalk.green('Locale Detection: ') + chalk.cyan(language('ZH-CN', 'EN-US')))
console.log(chalk.white(' [System] ') + chalk.green('YoRHa No.2 Type B Unit: ') + chalk.cyan('Online'))
console.log(chalk.white(' [System] ') + chalk.green('Scanner Type 9S Unit: ') + chalk.cyan('Standby'))
console.log(chalk.white(' [Mission] ') + chalk.yellow('Frontend Architecture Construction: ') + chalk.cyan('Awaiting Command'))
console.log(chalk.white(' [Bunker] ') + chalk.magenta('Glory to mankind. (人类荣光永存)'))
console.log(chalk.gray('--------------------------------------------------\n'))

// --- Commander 配置 ---
program
    .version(pkg.version)
    .description(language('AI驱动的前端CRUD代码生成器', 'AI-powered frontend CRUD code generator'))

program.option('-t, --template <type>', language('指定前端框架模板', 'Specify frontend framework template'), 'react')

program
    .command('init')
    .description(language('在当前目录初始化 .env 和 config.js 配置文件', 'Initialize .env and config.js in the current directory'))
    .action(() => {
        const tplConfig = path.resolve(__dirname, '../config.js')
        const tplEnv = path.resolve(__dirname, '../.env.example')
        const targetEnv = path.join(process.cwd(), '.env')
        const targetConfig = path.join(process.cwd(), 'config.js')

        fs.mkdirSync(path.join(process.cwd(), 'response'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenShot'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenPart'), { recursive: true })

        // .env 处理
        if (fs.existsSync(targetEnv)) {
            console.log(chalk.yellow(language(
                '🤖 Pod 042: [警告] 终端已存在 .env 文件，跳过生成以免覆盖数据。',
                '🤖 Pod 042: [Warning] .env already exists. Skipping to avoid data overwrite.'
            )));
        } else {
            fs.copyFileSync(tplEnv, targetEnv);
            console.log(chalk.green(language(
                '🤖 Pod 042: [报告] .env 存储完毕。',
                '🤖 Pod 042: [Report] .env storage complete.'
            )));
        }

        // config.js 处理
        if (fs.existsSync(targetConfig)) {
            console.log(chalk.yellow(language(
                '🤖 Pod 042: [警告] 终端已存在 config.js 文件，跳过生成以免覆盖数据。',
                '🤖 Pod 042: [Warning] config.js already exists. Skipping to avoid data overwrite.'
            )));
        } else {
            fs.copyFileSync(tplConfig, targetConfig)
            console.log(chalk.green(language(
                '🤖 Pod 042: [报告] config.js 存储完毕。',
                '🤖 Pod 042: [Report] config.js storage complete.'
            )));
        }

        console.log(chalk.cyan(language(
            '📡 Operator 6O: 呼叫 2B，环境配置文件已下发至本地终端！',
            '📡 Operator 6O: Calling 2B, environmental config files have been deployed to your local terminal!'
        )))
    })

program
    .command('watch:page')
    .description(language('监听截图，自动生成完整的增删改查页面', 'Watch screenshots and auto-generate complete CRUD pages'))
    .action(() => {
        const watchPage = require('../src/commands/watch-page')
        watchPage(program.opts())
    })

program
    .command('watch:part')
    .description(language('监听截图，自动生成局部 UI 组件', 'Watch screenshots and auto-generate partial UI components'))
    .action(() => {
        const watchPart = require('../src/commands/watch-part')
        watchPart(program.opts())
    })

program
    .command('watch:api')
    .description(language('监听 Response，自动对齐真实接口字段', 'Watch responses and auto-align real API fields'))
    .action(() => {
        const watchApi = require('../src/commands/watch-api')
        watchApi()
    })

program.parse(process.argv)