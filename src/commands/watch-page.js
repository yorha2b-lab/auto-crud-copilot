const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const Handlebars = require('handlebars')
const config = require('../../config.js')
const pagePrompt = require('../prompts/watch-page.js')
const { createTaskQueue } = require('../core/task-queue')
const stringify = require('json-stringify-pretty-compact')
const { recognizePage, generateMock } = require('../services/llm.js')
const { copyHooks, copyComponents, getExistingMenus } = require('../utils/utils.js')

const compilerPath = path.join(__dirname, `../core/${options.template}-compiler.js`)

if (!fs.existsSync(compilerPath)) {
    console.error(`\n❌ 糟糕！暂不支持 [${options.template}] 框架的自动生成。`)
    console.log(`💡 提示：目前仅内置了 react 编译器。`)
    console.log(`🚀 强烈欢迎社区大佬提 PR 补充 ${options.template}-compiler.js ！\n`)
    return
}

const { index, resource } = require(compilerPath)

const watchPage = options => {
    try {
        copyHooks(options)
        copyComponents(options)
    } catch (error) {
        console.error('❌ 程序运行出错:', error)
    }
    const queue = createTaskQueue(2)
    const menus = getExistingMenus()
    const tplDir = path.join(__dirname, `../../templates/${options.template}`)
    const indexTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8'))
    const resourceTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8'))
    queue.onIdle(() => {
        console.log('💾 所有排队的截图已处理完成，正在统一更新 menu 配置...')
        const constantDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(constantDir)) fs.mkdirSync(constantDir, { recursive: true })
        fs.writeFileSync(path.join(constantDir, 'constant.js'), `export const menus = ${stringify.default(menus, { indent: 4, maxLength: 50 })}`)
        console.log('✅ Menu 配置更新成功！')
    })
    const watcher = chokidar.watch('./screenShot', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    })
    watcher.on('add', filePath => {
        queue.add(async () => {
            const startTime = Date.now()
            const mockDir = path.join(process.cwd(), 'mock')
            const fileName = path.basename(filePath, path.extname(filePath))
            const targetDir = path.join(process.cwd(), config.pagesDir, fileName)

            try {
                if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
                console.log(`🚀 开始处理排队任务: ${fileName}...`)
                const pageConfig = await recognizePage(pagePrompt, filePath)
                fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig, resourceTpl }))
                fs.writeFileSync(path.join(targetDir, 'index.js'), index({ fileName, indexTpl, pageConfig }))
                if (!menus.find(m => m.key === fileName)) {
                    menus.push({ label: fileName, key: fileName })
                }
                if (config.needMock) {
                    console.log(`🚀 开始生成 ${fileName} 的 Mock 数据...`)
                    const rawContent = await generateMock(pageConfig.table.columns, fileName)
                    fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${stringify.default(rawContent, { indent: 4, maxLength: 200 })}`.replaceAll(`"'`, `"`).replaceAll(`'"`, `"`))
                    console.log(`生成 ${fileName} 的 Mock 数据耗时: ${(Date.now() - startTime) / 1000} 秒`)
                }
                const endTime = Date.now()
                //fs.unlinkSync(filePath)
                console.log(`✅ 模块 [${fileName}] 装配完成！耗时 ${(endTime - startTime) / 1000} 秒`)
            } catch (error) {
                console.error(`❌ 处理失败: ${filePath}`, error)
            }
        })
    })
}

module.exports = watchPage
