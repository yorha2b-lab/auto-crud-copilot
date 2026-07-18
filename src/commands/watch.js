module.exports = () => {

    const fs = require('fs')
    const path = require('path')
    const chokidar = require('chokidar')

    const bootstrap = require('../bootstrap')
    const { core, menus, yorha, config, dialog, handlers, foundation } = bootstrap.get()

    const { createTaskQueue } = core
    const { contextStringify } = foundation
    const { pod042, commander, operator6O } = yorha

    const queue = createTaskQueue(2)

    queue.onIdle(() => {
        pod042.report(dialog.pod042.queueEmpty)
        const utilsDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true })
        fs.writeFileSync(path.join(utilsDir, 'menus.js'), `export const menus = ${contextStringify({ context: menus, maxLength: 50 })}`)
        commander.report(dialog.bunker.systemStandby, 'gray')
    })

    const options = {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    }

    const fileWatcher = chokidar.watch(['./config.js'], options)
    const dirWatcher = chokidar.watch(['./screenShot', './screenPart', './response'], options)

    operator6O.report(dialog.operator6O.call2B)

    const routes = Object.values(handlers)

    dirWatcher.on('add', filePath => {
        const absolutePath = path.resolve(filePath)
        const route = routes.find(route => absolutePath.includes(route.watch))
        if (route) {
            queue.add(() => route.handle(filePath))
        }
    })

    fileWatcher.on('change', file => {
        if (file.endsWith('config.js')) {
            bootstrap.reboot()
        }
    })

}