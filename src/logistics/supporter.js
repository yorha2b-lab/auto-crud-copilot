const fs = require('fs')
const path = require('path')

const getConfig = () => {
    const localConfigPath = path.join(process.cwd(), 'bunker', 'config.js') // 项目配置
    const defaultConfigPath = path.resolve(__dirname, '../../config.js') // 默认配置
    let config = require(defaultConfigPath)
    if (fs.existsSync(localConfigPath)) {
        const userConfig = require(localConfigPath)
        config = { ...config, ...userConfig }
    }
    return config
}

const findUnit = (units, filePath) => {
    const relative = path.relative(path.resolve('bunker'), path.resolve(filePath))
    const root = relative.split(path.sep)[0]
    return units.find(unit => root === unit.station)
}

const getExistingMenus = (dir = 'src/pages') => {
    const pagesDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(pagesDir)) return []
    return fs.readdirSync(pagesDir)
        .filter(file => fs.statSync(path.join(pagesDir, file)).isDirectory())
        .map(file => ({ label: file, key: file }))
}

const copyTemplateDir = (template, templateSubDir, targetSubDir) => {
    const targetDir = path.join(process.cwd(), targetSubDir)
    const sourceDir = path.join(__dirname, `../workshop/${template}/${templateSubDir}`)
    if (!fs.existsSync(sourceDir)) return
    fs.mkdirSync(targetDir, { recursive: true })
    fs.readdirSync(sourceDir).forEach(file => {
        const src = path.join(sourceDir, file)
        const dest = path.join(targetDir, file)
        if (!fs.existsSync(dest)) {
            fs.cpSync(src, dest, { recursive: true })
        }
    })
}

module.exports = {
    findUnit,
    getConfig,
    copyTemplateDir,
    getExistingMenus,
}