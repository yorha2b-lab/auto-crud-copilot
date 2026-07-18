#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const pkg = require('../package.json')
const { program } = require('commander')
const { local, matrixEffect, bootSequence } = require('../src/utils/ux')

const dialogs = require('../src/bootstrap/dialogs')()
const dialog = dialogs[local]

program
    .version(pkg.version)
    .description(dialog.bunker.desc)

program.option('-t, --template <type>', dialog.bunker.argDesc, 'react')

program
    .command('init')
    .description(dialog.bunker.initDesc)
    .action(() => {
        const tplConfig = path.resolve(__dirname, '../config.js')
        const tplEnv = path.resolve(__dirname, '../.env.example')
        const targetEnv = path.join(process.cwd(), '.env')
        const targetConfig = path.join(process.cwd(), 'config.js')

        fs.mkdirSync(path.join(process.cwd(), 'response'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenShot'), { recursive: true })
        fs.mkdirSync(path.join(process.cwd(), 'screenPart'), { recursive: true })

        if (fs.existsSync(targetEnv)) {
            console.log(chalk.yellow(dialog.bunker.envCheck))
        } else {
            fs.copyFileSync(tplEnv, targetEnv)
            console.log(chalk.green(dialog.bunker.envCopy))
        }

        if (fs.existsSync(targetConfig)) {
            console.log(chalk.yellow(dialog.bunker.configCheck))
        } else {
            fs.copyFileSync(tplConfig, targetConfig)
            console.log(chalk.green(dialog.bunker.configCopy))
        }

        const bunkerCmd = chalk.yellow(`'bunker': 'autodev watch'`)
        console.log(chalk.cyan(dialog.bunker.initComplete(bunkerCmd)))
    })

program
    .command('watch')
    .alias('start')
    .description(dialog.bunker.watchDesc)
    .action(async () => {
        const bunker = require('../src/bootstrap')
        const result = bunker.init(program.opts(), dialogs)
        if (!result) {
            return
        }
        const { commander } = result.yorha
        const { config } = result.infrastructure
        const { apiDoc, needMock, proxyTarget, enableAutoAlignment } = config

        const bootTower = proxyTarget && !needMock && enableAutoAlignment

        await bootSequence({ dialog, version: pkg.version, bootTower, commander })
        require('../src/commands/watch')()
        if (bootTower) {
            require('../src/labs/tower')()
        }
        if (apiDoc && enableAutoAlignment) {
            require('../src/labs/linker')()
        }
        process.on('SIGINT', () => {
            commander.log(dialog.bunker.systemOffline)
            matrixEffect(500)
        })
    })

program.parse(process.argv)