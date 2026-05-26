const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const stringify = require('json-stringify-pretty-compact')

const { get } = require(path.join(__dirname, '../core/context'))
const { copyTemplateDir } = require(path.join(__dirname, '../utils/utils.js'))
const { createTaskQueue } = require(path.join(__dirname, '../core/task-queue.js'))

const watch = () => {

    const { menus, config, options, template, language, apiHandler, pageHandler, partHandler } = get()

    const compilerPath = path.join(__dirname, `../core/${template}-compiler.js`)
    if (!fs.existsSync(compilerPath)) {
        console.error(chalk.red(language(`❌ 暂不支持 [${template}] 框架。`, `❌ [${template}] framework not supported.`)))
        return
    }

    try {
        if (config.hbsDir === '') {
            copyTemplateDir(options, 'hooks', config.hooksDir)
            copyTemplateDir(options, 'utils', config.utilsDir)
            copyTemplateDir(options, 'components', config.componentsDir)
        }
    } catch (error) {
        console.error(language('❌ 模板构筑失败:', '❌ Template construction failed:'), error)
    }

    const queue = createTaskQueue(2)

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
        '📡 Operator 6O: 呼叫 2B，地堡全频道联动监控已就绪！',
        '📡 Operator 6O: Calling 2B, all-channel linked monitoring is ready!'
    )))

    watcher.on('add', filePath => {

        const absolutePath = path.resolve(filePath)

        if (absolutePath.includes('screenShot')) {
            queue.add(() => pageHandler(filePath))
        }
        else if (absolutePath.includes('screenPart')) {
            queue.add(() => partHandler(filePath))
        }
        else if (absolutePath.includes('response')) {
            queue.add(() => apiHandler(filePath))
        }
    })
}

module.exports = watch