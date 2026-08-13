const fs = require('fs')
const path = require('path')

module.exports = ({ units, yorha, dialog, template, logistics }) => {

    const { copyTemplateDir } = logistics.supporter
    const { hbsDir, hooksDir, utilsDir, componentsDir } = logistics.supporter.getConfig()

    try {
        Object.values(units).forEach(unit => fs.mkdirSync(path.join(process.cwd(), 'bunker', unit.station), { recursive: true }))
        if (!hbsDir) {
            copyTemplateDir(template, 'kit', utilsDir)
            copyTemplateDir(template, 'extensions', hooksDir)
            copyTemplateDir(template, 'standardParts', componentsDir)
        }
    } catch (error) {
        yorha.commander.report(dialog.bunker.copyTemplateError(error), 'red')
    }
}