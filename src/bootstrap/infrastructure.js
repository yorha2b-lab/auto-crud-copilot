module.exports = ({ ux, config, yorha, options, copyTemplateDir }) => {

    const { local } = ux
    const { commander } = yorha
    const { hbsDir, hooksDir, utilsDir, componentsDir } = config

    try {
        if (hbsDir === '') {
            copyTemplateDir(options, 'hooks', hooksDir)
            copyTemplateDir(options, 'utils', utilsDir)
            copyTemplateDir(options, 'components', componentsDir)
        }
    } catch (error) {
        commander.log(local === 'ZH-CN' ? `模板构筑失败: ${error}` : `Template construction failed: ${error}`, 'red')
    }
}