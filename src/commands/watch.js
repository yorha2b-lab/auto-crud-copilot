const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')

const { createTaskQueue } = require('../core/task-queue')
const { recognizePage, generateMock, alignResponseFields } = require('../services/llm.js')
const { language, getConfig, getExistingMenus, copyTemplateDir } = require('../utils/utils.js')

const watch = options => {

    const config = getConfig()
    const template = options.template
    const queue = createTaskQueue(2)
    const menus = getExistingMenus()

    const compilerPath = path.join(__dirname, `../core/${template}-compiler.js`)
    if (!fs.existsSync(compilerPath)) {
        console.error(chalk.red(language(`❌ 暂不支持 [${template}] 框架。`, `❌ [${template}] framework not supported.`)))
        return
    }

    const { index, resource } = require(compilerPath)

    try {
        if (config.hbsDir === '') {
            copyTemplateDir(options, 'hooks', config.hooksDir)
            copyTemplateDir(options, 'utils', config.utilsDir)
            copyTemplateDir(options, 'components', config.componentsDir)
        }
    } catch (error) {
        console.error(language('❌ 模板构筑失败:', '❌ Template construction failed:'), error)
    }

    const tplDir = config.hbsDir !== '' ? path.join(process.cwd(), config.hbsDir) : path.join(__dirname, `../../templates/${template}`)
    const indexTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8'))
    const resourceTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8'))

    const context = {
        menus, language,
        config, options,
        resource, index,
        resourceTpl, indexTpl,
        recognizePage, generateMock, alignResponseFields,
        pagePrompt: require(path.join(__dirname, `../prompts/${template}/watch-page.js`)),
        partPrompt: require(path.join(__dirname, `../prompts/${template}/watch-part.js`))
    }

    const apiHandler = require('./handlers/api-handler')
    const pageHandler = require('./handlers/page-handler')
    const partHandler = require('./handlers/part-handler')

    queue.onIdle(() => {
        console.log(chalk.green(language(
            '\n🤖 Pod 042: [报告] 队列已空，正在向 Bunker 同步 Menu 路由配置...',
            '\n🤖 Pod 042: [Report] Queue empty. Syncing Menu configuration to Bunker...'
        )))
        const utilsDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true })
        fs.writeFileSync(path.join(utilsDir, 'menus.js'), `export const menus = ${stringify.default(menus, { indent: 4, maxLength: 50 })}`)
        console.log(chalk.gray(language(
            '\n🤖 [System] 未检测到运行中的任务，系统待机中...\n',
            '\n🤖 [System] System is STANDBY.\n'
        )))
    })

    const watcher = chokidar.watch(['./screenShot', './screenPart', './response'], {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    })

    console.log(chalk.magenta(language(
        '📡 Operator 6O: 呼叫 2B，地堡全频道联动监控已就绪！\n',
        '📡 Operator 6O: Calling 2B, all-channel linked monitoring is ready!\n'
    )))

    watcher.on('add', filePath => {

        const absolutePath = path.resolve(filePath)

        if (absolutePath.includes('screenShot')) {
            queue.add(() => pageHandler(filePath, context))
        }
        else if (absolutePath.includes('screenPart')) {
            queue.add(() => partHandler(filePath, context))
        }
        else if (absolutePath.includes('response')) {
            queue.add(() => apiHandler(filePath, context))
        }
    })
}

module.exports = watch