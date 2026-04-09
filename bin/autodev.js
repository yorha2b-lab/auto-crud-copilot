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
console.log(chalk.white(' [System] ') + chalk.green('Full-Channel Link: ') + chalk.cyan('Established')) // 2.0 新增
console.log(chalk.white(' [Mission] ') + chalk.yellow('Bunker Construction Protocol: ') + chalk.cyan('v' + pkg.version))
console.log(chalk.white(' [Bunker] ') + chalk.magenta('Glory to mankind. (人类荣光永存)'))
console.log(chalk.gray('--------------------------------------------------\n'))

program
    .version(pkg.version)
    .description(language('AI驱动的前端CRUD代码生成器', 'AI-powered frontend CRUD code generator'))

program.option('-t, --template <type>', language('指定前端框架模板', 'Specify frontend framework template'), 'react')

program
    .command('init')
    .description(language('在当前目录初始化地堡构筑环境', 'Initialize Bunker construction environment'))
    .action(() => {
        const tplConfig = path.resolve(__dirname, '../config.js')
        const tplEnv = path.resolve(__dirname, '../.env.example')
        const targetEnv = path.join(process.cwd(), '.env')
        const targetConfig = path.join(process.cwd(), 'config.js')

        fs.mkdirSync(path.join(process.cwd(), 'response'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenShot'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenPart'), { recursive: true })

        if (fs.existsSync(targetEnv)) {
            console.log(chalk.yellow(language('🤖 Pod 042: [警告] 终端已存在 .env 文件，跳过生成。', '🤖 Pod 042: [Warning] .env already exists.')))
        } else {
            fs.copyFileSync(tplEnv, targetEnv)
            console.log(chalk.green(language('🤖 Pod 042: [报告] .env 存储完毕。', '🤖 Pod 042: [Report] .env storage complete.')))
        }

        if (fs.existsSync(targetConfig)) {
            console.log(chalk.yellow(language('🤖 Pod 042: [警告] 终端已存在 config.js 文件，跳过生成。', '🤖 Pod 042: [Warning] config.js already exists.')))
        } else {
            fs.copyFileSync(tplConfig, targetConfig)
            console.log(chalk.green(language('🤖 Pod 042: [报告] config.js 存储完毕。', '🤖 Pod 042: [Report] config.js storage complete.')))
        }

        console.log(chalk.cyan(language(
            '📡 Operator 6O: 呼叫 2B，地堡部署完毕，请开启 watch 模式进入战场！',
            '📡 Operator 6O: Calling 2B, Bunker deployed. Execute [watch] to enter the battlefield!'
        )))
    })

program
    .command('watch')
    .alias('start')
    .description(language('开启全频道联动监控：支持 Page/Part/API 协同构筑', 'Start full-channel linked monitoring: Coordinated Page/Part/API construction'))
    .action(() => {
        const watch = require('../src/commands/watch')
        watch(program.opts())
        process.on('SIGINT', () => {
            console.log('\n')
            console.log(chalk.gray('--------------------------------------------------'))
            console.log(chalk.white(' [System] ') + chalk.yellow(language('正在断开神经云链接...', 'Disconnecting Neural Link...')))
            console.log(chalk.white(' [System] ') + chalk.green(language('所有构筑数据已同步至 Bunker 存储节点。', 'All data synced to Bunker storage nodes.')))
            setTimeout(() => {
                console.log(chalk.cyan(language(
                    '📡 Operator 6O: 辛苦了，2B！地堡系统已进入待机状态，愿人类荣光永存。',
                    '📡 Operator 6O: Well done, 2B! Bunker system is in standby. Glory to mankind.'
                )))
                console.log(chalk.gray(' [Bunker] ') + chalk.white('Signal Lost... Bye.\n'))
                process.exit(0)
            }, 500)
        })
    })

program.parse(process.argv)