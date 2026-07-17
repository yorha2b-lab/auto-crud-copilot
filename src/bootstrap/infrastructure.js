module.exports = ({ ux, config, options, copyTemplateDir }) => {

    const { language } = ux
    const { hbsDir, hooksDir, utilsDir, componentsDir } = config

    try {
        if (hbsDir === '') {
            copyTemplateDir(options, 'hooks', hooksDir)
            copyTemplateDir(options, 'utils', utilsDir)
            copyTemplateDir(options, 'components', componentsDir)
        }
    } catch (error) {
        console.error(language('❌ 模板构筑失败:', '❌ Template construction failed:'), error)
    }
}