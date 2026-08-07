module.exports = () => {

    const chokidar = require('chokidar')

    const bootstrap = require('../bootstrap')

    const ctx = bootstrap.get()
    const routes = Object.values(ctx.handlers)
    const queue = require('../core/queue')(2, ctx)

    queue.onIdle(() => ctx.yorha.commander.report(ctx.dialog.bunker.systemStandby, 'gray'))

    const options = {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    }

    const settingWatcher = chokidar.watch(['./bunker/config.js'], options)
    const fileWatcher = chokidar.watch(routes.map(route => `./bunker/${route.watch}`), options)

    ctx.yorha.operator6O.report(ctx.dialog.operator6O.call2B)

    fileWatcher.on('add', filePath => {
        const route = ctx.utils.foundation.findRoute(routes, filePath)
        if (route) {
            queue.add(() => route.handle(filePath))
        }
    })

    settingWatcher.on('change', file => {
        if (file.endsWith('config.js')) {
            bootstrap.reboot()
        }
    })

}