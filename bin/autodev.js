#!/usr/bin/env node
const path = require('path')
const chalk = require('chalk')
const pkg = require('../package.json')
const { program } = require('commander')
const local = Intl.DateTimeFormat().resolvedOptions().locale.toUpperCase()

const { matchDialog, matrixEffect } = require('../src/utils/ux')
const recruiter = require('../src/kernel/recruiter')
const dialogs = recruiter(path.join(__dirname, '../src/dialogs'))
const dialog = matchDialog(local, dialogs) ?? dialogs['EN-US']

program
    .version(pkg.version)
    .description(dialog.bunker.desc)

program.option('-t, --template <type>', dialog.bunker.argDesc, 'react')

program
    .command('init')
    .description(dialog.bunker.initDesc)
    .action(() => {
        const battlefield = {
            files: [
                { from: '.env.example', to: '.env', exist: 'envCheck', success: 'envCopy' },
                { from: 'config.js', to: 'config.js', exist: 'configCheck', success: 'configCopy' }
            ]
        }
        const installer = require('../src/utils/installer')({ root: process.cwd(), dialog })
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
        const result = await bunker.init(program.opts(), dialog, pkg.version, local)
        if (!result) {
            return
        }
        require('../src/commands/watch')()
        process.on('SIGINT', () => {
            result.yorha.commander.report(dialog.bunker.systemOffline, 'gray')
            matrixEffect(500, dialog, result)
        })
    })

program.parse(process.argv)