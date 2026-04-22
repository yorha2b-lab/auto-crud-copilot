#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { program } = require('commander')
const pkg = require(path.join(__dirname, '../package.json'))
const { language, matrixEffect, bootSequence } = require(path.join(__dirname, '../src/utils/utils.js'))

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

        const bunkerCmd = chalk.yellow('"bunker": "autodev watch"')
        console.log(chalk.cyan(language(
            `📡 Operator 6O: 呼叫 2B, 地堡部署完毕, 为了更快捷地进入战场，建议手动执行 [物理装配]: 将 ${bunkerCmd} 加入您的 package.json scripts 中`,
            `📡 Operator 6O: Calling 2B! Bunker deployment is complete. To expedite your entry into the battlefield, I recommend a manual [Physical Assembly]: Add ${bunkerCmd} to your package.json scripts.`
        )))
    })

program
    .command('watch')
    .alias('start')
    .description(language('开启全频道联动监控：支持 Page/Part/API 协同构筑', 'Start full-channel linked monitoring: Coordinated Page/Part/API construction'))
    .action(() => {
        bootSequence(pkg.version)
        const watch = require('../src/commands/watch')
        watch(program.opts())
        process.on('SIGINT', () => {
            console.log('\n')
            console.log(chalk.gray('--------------------------------------------------'))
            console.log(chalk.white(' [System] ') + chalk.yellow(language('正在断开神经云链接,执行数据物理封存...', 'Disconnecting Neural Link, Executing Physical Assembly...')))
            matrixEffect(500)
        })
    })

program.parse(process.argv)