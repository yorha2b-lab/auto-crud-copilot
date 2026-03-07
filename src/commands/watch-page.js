/**
 * 监听截图并生成完整 CRUD 页面的命令模块
 *
 * 此模块实现以下功能：
 * 1. 监听 screenShot 目录下的截图文件
 * 2. 使用 AI 识别截图中的 UI 结构
 * 3. 根据识别结果生成完整的前端 CRUD 页面代码
 * 4. 可选生成 Mock 数据
 * 5. 更新菜单配置
 */

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const Handlebars = require('handlebars')
const config = require('../../config.js')
const pagePrompt = require('../prompts/watch-page.js')
const { createTaskQueue } = require('../core/task-queue')
const stringify = require('json-stringify-pretty-compact')
const { index, resource } = require('../core/compiler.js')
const { recognizePage, generateMock } = require('../services/llm.js')
const { copyHooks, copyComponents, getExistingMenus } = require('../utils/utils.js')

/**
 * 监听截图并生成 CRUD 页面
 * @param {Object} options - 命令行选项
 * @param {string} options.template - 前端框架模板类型
 */
const watchPage = options => {
    // 初始化项目结构：复制必要的 hooks 和 components
    try {
        copyHooks(options)
        copyComponents(options)
    } catch (error) {
        console.error('❌ 程序运行出错:', error)
    }

    // 创建任务队列，限制并发数为 2
    const queue = createTaskQueue(2)
    // 获取现有菜单配置
    const menus = getExistingMenus()
    // 准备模板文件
    const tplDir = path.join(__dirname, `../../templates/${options.template}`)
    const indexTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8'))
    const resourceTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8'))

    // 当队列为空时，更新菜单配置
    queue.onIdle(() => {
        console.log('💾 所有排队的截图已处理完成，正在统一更新 menu 配置...')
        const constantDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(constantDir)) fs.mkdirSync(constantDir, { recursive: true })
        fs.writeFileSync(path.join(constantDir, 'constant.js'), `export const menus = ${stringify.default(menus, { indent: 4, maxLength: 50 })}`)
        console.log('✅ Menu 配置更新成功！')
    })

    // 设置文件监听器，监听 screenShot 目录
    const watcher = chokidar.watch('./screenShot', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    })

    // 当检测到新文件时，添加到任务队列
    watcher.on('add', filePath => {
        queue.add(async () => {
            const startTime = Date.now()
            const mockDir = path.join(process.cwd(), 'mock')
            const fileName = path.basename(filePath, path.extname(filePath))
            const targetDir = path.join(process.cwd(), config.pagesDir, fileName)

            try {
                // 确保目标目录存在
                if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

                console.log(`🚀 开始处理排队任务: ${fileName}...`)

                // 使用 AI 识别页面结构
                const pageConfig = await recognizePage(pagePrompt, filePath)

                // 生成资源文件和页面文件
                fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig, resourceTpl }))
                fs.writeFileSync(path.join(targetDir, 'index.js'), index({ fileName, indexTpl, pageConfig }))

                // 更新菜单配置
                if (!menus.find(m => m.key === fileName)) {
                    menus.push({ label: fileName, key: fileName })
                }

                // 如果需要，生成 Mock 数据
                if (config.needMock) {
                    console.log(`🚀 开始生成 ${fileName} 的 Mock 数据...`)
                    const rawContent = await generateMock(pageConfig.table.columns, fileName)
                    fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${stringify.default(rawContent, { indent: 4, maxLength: 200 })}`.replaceAll(`"'`, `"`).replaceAll(`'"`, `"`))
                    console.log(`生成 ${fileName} 的 Mock 数据耗时: ${(Date.now() - startTime) / 1000} 秒`)
                }

                const endTime = Date.now()
                //fs.unlinkSync(filePath) // 可选：处理完成后删除截图
                console.log(`✅ 模块 [${fileName}] 装配完成！耗时 ${(endTime - startTime) / 1000} 秒`)
            } catch (error) {
                console.error(`❌ 处理失败: ${filePath}`, error)
            }
        })
    })
}

module.exports = watchPage
