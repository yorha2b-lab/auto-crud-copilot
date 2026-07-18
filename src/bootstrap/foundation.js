module.exports = ({ config, yorha, dialog, template, foundation }) => {

    const { copyTemplateDir } = foundation
    const { hbsDir, hooksDir, utilsDir, componentsDir } = config

    try {
        if (hbsDir === '') {
            copyTemplateDir(template, 'hooks', hooksDir)
            copyTemplateDir(template, 'utils', utilsDir)
            copyTemplateDir(template, 'components', componentsDir)
        }
    } catch (error) {
        yorha.commander.report(dialog.bunker.copyTemplateError(error), 'red')
    }
}