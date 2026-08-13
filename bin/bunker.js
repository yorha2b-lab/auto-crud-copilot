#!/usr/bin/env node
const path = require('path')
const chalk = require('chalk')
const pkg = require('../package.json')
const { program } = require('commander')
const local = Intl.DateTimeFormat().resolvedOptions().locale.toUpperCase()

const { matchDialog, terminalCollapse } = require('../src/logistics/presenter')
const recruiter = require('../src/headquarters/recruiter')
const dialogues = recruiter(path.join(__dirname, '../src/dialogues'))
const dialog = matchDialog(local, dialogues) ?? dialogues['EN-US']

program
    .version(pkg.version)
    .description(dialog.bunker.desc)

program.option('-t, --template <type>', dialog.bunker.argDesc, 'react')

program
    .command('init')
    .description(dialog.bunker.initDesc)
    .action(() => {
        const outpost = {
            files: [
                { from: '.env.example', to: '.env', exist: 'envCheck', success: 'envCopy' },
                { from: 'config.js', to: 'config.js', exist: 'configCheck', success: 'configCopy' }
            ]
        }
        const quartermaster = require('../src/headquarters/quartermaster')({ root: process.cwd(), dialog })
        Object.entries(outpost).forEach(([type, items]) => items.forEach(quartermaster[type]))
        const bunkerCmd = chalk.yellow(`'bunker': 'bunker boot'`)
        console.log(chalk.cyan(dialog.bunker.initComplete(bunkerCmd)))
    })

program
    .command('boot')
    .alias('start')
    .description(dialog.bunker.bootDesc)
    .action(async () => {
        const bunker = require('../src/awakening')
        const result = await bunker.init(program.opts(), dialog, pkg.version, local)
        if (!result) {
            return
        }
        require('../src/headquarters/observer')(bunker)
        process.on('SIGINT', () => {
            result.yorha.commander.report(dialog.bunker.systemOffline, 'gray')
            result.labs?.scout?.close()
            terminalCollapse(500, dialog, result)
        })
    })

program.parse(process.argv)