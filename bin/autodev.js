#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const pkg = require('../package.json')
const { program } = require('commander')
const { local, matrixEffect, bootSequence } = require('../src/utils/ux')

const dialogs = require('../src/bootstrap/registry')({ dir: path.join(__dirname, '../src/dialogs') })
const dialog = dialogs[local] ?? dialogs['EN-US']

program
    .version(pkg.version)
    .description(dialog.bunker.desc)

program.option('-t, --template <type>', dialog.bunker.argDesc, 'react')

program
    .command('init')
    .description(dialog.bunker.initDesc)
    .action(() => {
        const battlefield = {
            dirs: ['response', 'screenShot', 'screenPart'],
            files: [
                { from: '.env.example', to: '.env', exist: 'envCheck', success: 'envCopy' },
                { from: 'config.js', to: 'config.js', exist: 'configCheck', success: 'configCopy' }
            ]
        }
        const installer = {
            dirs: dir => fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true }),
            files: ({ from, to, exist, success }) => {
                const target = path.join(process.cwd(), to)
                if (fs.existsSync(target)) {
                    return console.log(chalk.yellow(dialog.bunker[exist]))
                }
                fs.copyFileSync(path.resolve(__dirname, `../${from}`), target)
                console.log(chalk.green(dialog.bunker[success]))
            }
        }
        Object.entries(battlefield).forEach(([type, items]) => items.forEach(installer[type]))
        const bunkerCmd = chalk.yellow(`'bunker': 'autodev watch'`)
        console.log(chalk.cyan(dialog.bunker.initComplete(bunkerCmd)))
    })

program
    .command('watch')
    .alias('start')
    .description(dialog.bunker.watchDesc)
    .action(async () => {
        const bunker = require('../src/bootstrap')
        const result = bunker.init(program.opts(), dialog)
        if (!result) {
            return
        }
        await bootSequence(pkg.version)
        require('../src/commands/watch')()
        process.on('SIGINT', () => {
            result.yorha.commander.report(dialog.bunker.systemOffline, 'gray')
            matrixEffect(500, dialog)
        })
    })

program.parse(process.argv)