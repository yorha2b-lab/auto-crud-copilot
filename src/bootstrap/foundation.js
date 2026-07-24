const fs = require('fs')
const path = require('path')

module.exports = ({ yorha, config, dialog, handlers, template, foundation }) => {

    const { copyTemplateDir } = foundation
    const { hbsDir, hooksDir, utilsDir, componentsDir } = config

    try {
        Object.values(handlers).forEach(handler => fs.mkdirSync(path.join(process.cwd(), handler.watch), { recursive: true }))
        if (hbsDir === '') {
            copyTemplateDir(template, 'hooks', hooksDir)
            copyTemplateDir(template, 'utils', utilsDir)
            copyTemplateDir(template, 'components', componentsDir)
        }
    } catch (error) {
        yorha.commander.report(dialog.bunker.copyTemplateError(error), 'red')
    }
}