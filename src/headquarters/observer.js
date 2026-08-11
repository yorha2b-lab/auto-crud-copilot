module.exports = bunker => {

    const chokidar = require('chokidar')

    const acp = bunker.get()
    const units = Object.values(acp.units)
    const dispatcher = require('../headquarters/dispatcher')(acp, 2)

    dispatcher.onIdle(() => acp.yorha.commander.report(acp.dialog.bunker.systemStandby, 'gray'))

    const options = {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    }

    const settingWatcher = chokidar.watch(['./bunker/config.js'], options)
    const fileWatcher = chokidar.watch(units.map(unit => `./bunker/${unit.station}`), options)

    acp.yorha.operator6O.report(acp.dialog.operator6O.call2B)

    fileWatcher.on('add', filePath => {
        const unit = acp.logistics.foundation.findUnit(units, filePath)
        if (unit) {
            dispatcher.add(() => unit.handle(filePath))
        }
    })

    settingWatcher.on('change', file => {
        if (file.endsWith('config.js')) {
            bunker.reboot()
        }
    })

}