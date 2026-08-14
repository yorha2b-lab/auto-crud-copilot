module.exports = bunker => {

    const path = require('path')
    const chokidar = require('chokidar')
    const commander = require('../headquarters/commander')(bunker)

    const settingWatcher = chokidar.watch('./bunker/config.js', { persistent: true, ignoreInitial: true })

    const missionWatcher = chokidar.watch('./bunker/mission/', {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    })

    missionWatcher.on('add', filePath => {
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(filePath))) {
            commander.receive({ input: filePath, type: 'file-added' })
        }
    })

    settingWatcher.on('change', file => {
        if (file.endsWith('config.js')) {
            bunker.reboot()
        }
    })
}