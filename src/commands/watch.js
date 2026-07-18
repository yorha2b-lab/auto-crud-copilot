module.exports = () => {

    const fs = require('fs')
    const path = require('path')
    const chokidar = require('chokidar')

    const { ux, core, yorha, dialogs, handlers, infrastructure } = require('../bootstrap').get()

    const { local } = ux
    const dialog = dialogs[local]
    const { createTaskQueue } = core
    const { pod042, commander, operator6O } = yorha
    const { menus, config, contextStringify } = infrastructure

    const queue = createTaskQueue(2)

    queue.onIdle(() => {
        pod042.report(dialog.pod042.queueEmpty)
        const utilsDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true })
        fs.writeFileSync(path.join(utilsDir, 'menus.js'), `export const menus = ${contextStringify({ context: menus, maxLength: 50 })}`)
        commander.log(dialog.bunker.systemStandby)
    })

    const watcher = chokidar.watch(['./screenShot', './screenPart', './response'], {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    })

    operator6O.report(dialog.operator6O.call2B)

    const routes = Object.values(handlers)

    watcher.on('add', filePath => {
        const absolutePath = path.resolve(filePath)
        const route = routes.find(route => absolutePath.includes(route.watch))
        if (route) {
            queue.add(() => route.handle(filePath))
        }
    })

}