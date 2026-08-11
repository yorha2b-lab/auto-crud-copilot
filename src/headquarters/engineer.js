const fs = require('fs')
const path = require('path')

module.exports = ({ units, yorha, dialog, template, logistics }) => {

    const { copyTemplateDir } = logistics.foundation
    const { hbsDir, hooksDir, utilsDir, componentsDir } = logistics.foundation.getConfig()

    try {
        Object.values(units).forEach(unit => fs.mkdirSync(path.join(process.cwd(), 'bunker', unit.station), { recursive: true }))
        if (!hbsDir) {
            copyTemplateDir(template, 'hooks', hooksDir)
            copyTemplateDir(template, 'utils', utilsDir)
            copyTemplateDir(template, 'components', componentsDir)
        }
    } catch (error) {
        yorha.commander.report(dialog.bunker.copyTemplateError(error), 'red')
    }
}