const fs = require('fs')
const path = require('path')

module.exports = ({ utils, yorha, dialog, handlers, template }) => {

    const { copyTemplateDir } = utils.foundation
    const { hbsDir, hooksDir, utilsDir, componentsDir } = utils.foundation.getConfig()

    try {
        Object.values(handlers).forEach(handler => fs.mkdirSync(path.join(process.cwd(), 'bunker', handler.watch), { recursive: true }))
        if (!hbsDir) {
            copyTemplateDir(template, 'hooks', hooksDir)
            copyTemplateDir(template, 'utils', utilsDir)
            copyTemplateDir(template, 'components', componentsDir)
        }
    } catch (error) {
        yorha.commander.report(dialog.bunker.copyTemplateError(error), 'red')
    }
}