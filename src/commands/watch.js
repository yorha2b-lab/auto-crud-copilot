module.exports = () => {

    const fs = require('fs')
    const path = require('path')
    const chokidar = require('chokidar')

    const bootstrap = require('../bootstrap')

    const ctx = bootstrap.get()
    const routes = Object.values(ctx.handlers)
    const config = ctx.utils.foundation.getConfig()
    const queue = require('../kernel/queue')(2, ctx)

    queue.onIdle(() => {
        ctx.yorha.pod042.report(ctx.dialog.pod042.queueEmpty)
        const utilsDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true })
        fs.writeFileSync(path.join(utilsDir, 'menus.js'), `export const menus = ${ctx.utils.generator.contextStringify({ context: ctx.utils.foundation.getExistingMenus(config.pagesDir), maxLength: 50 })}`)
        ctx.yorha.commander.report(ctx.dialog.bunker.systemStandby, 'gray')
    })

    const options = {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    }

    const fileWatcher = chokidar.watch(['./bunker/config.js'], options)
    const dirWatcher = chokidar.watch(routes.map(route => `./bunker/${route.watch}`), options)

    ctx.yorha.operator6O.report(ctx.dialog.operator6O.call2B)

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