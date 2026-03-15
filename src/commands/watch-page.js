const fs = require('fs')
const ora = require('ora') // 命令行加载动画
const path = require('path')
const chalk = require('chalk')


/**
 * 监听截图目录，自动生成 CRUD 页面
 * @param {Object} options - 命令行选项
 * @param {string} options.template - 前端框架模板（react/vue/angular）
 */
const watchPage = options => {

    const chokidar = require('chokidar') // 文件监听库
    const Handlebars = require('handlebars') // 模板引擎
    const pagePrompt = require('../prompts/watch-page.js') // 页面识别提示词
    const { createTaskQueue } = require('../core/task-queue') // 任务队列，控制并发
    const stringify = require('json-stringify-pretty-compact') // 格式化 JSON
    const { recognizePage, generateMock } = require('../services/llm.js') // AI 服务
    const { getConfig, copyTemplateDir, getExistingMenus } = require('../utils/utils.js') // 工具函数

    const config = getConfig()

    // 根据框架加载对应的编译器（react-compiler.js / vue-compiler.js 等）
    const compilerPath = path.join(__dirname, `../core/${options.template}-compiler.js`)

    // 检查是否支持该框架
    if (!fs.existsSync(compilerPath)) {
        console.error(`\n❌ 糟糕！暂不支持 [${options.template}] 框架的自动生成。`)
        console.log(`💡 提示：目前仅内置了 react 编译器。`)
        console.log(`🚀 强烈欢迎社区大佬提 PR 补充 ${options.template}-compiler.js ！\n`)
        return
    }

    // 加载编译器的 index 和 resource 函数
    const { index, resource } = require(compilerPath)

    try {
        // 首次运行时复制 hooks 和 components 模板到目标项目
        copyTemplateDir(options, 'hooks', config.hooksDir)
        copyTemplateDir(options, 'components', config.componentsDir)
    } catch (error) {
        console.error('❌ 程序运行出错:', error)
    }

    /**
     * 创建任务队列，限制并发数为 2。
     *
     * 为什么限制并发？
     * 1. 视觉大模型的 API 计费昂贵且通常有严格的 TPM/RPM (每分钟请求数) 限流。
     * 2. 如果用户一次性丢入 5 张截图，全量并发极易触发 HTTP 429 Too Many Requests 报错。
     * 3. 并发设为 2 是实测下来速度与稳定性的最佳平衡点。
     */
    const queue = createTaskQueue(2)

    // 获取已有的菜单配置
    const menus = getExistingMenus()

    // 加载模板文件
    const tplDir = path.join(__dirname, `../../templates/${options.template}`)
    const indexTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8'))
    const resourceTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8'))

    // 所有任务完成后统一更新菜单配置
    queue.onIdle(() => {
        console.log(chalk.green('🤖 Pod 042: [报告] 所有排队的视觉数据已解析完毕，正在向 Bunker 同步 Menu 路由配置...'))
        const constantDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(constantDir)) fs.mkdirSync(constantDir, { recursive: true })
        // 格式化菜单配置为 JS 代码
        fs.writeFileSync(path.join(constantDir, 'constant.js'), `export const menus = ${stringify.default(menus, { indent: 4, maxLength: 50 })}`)
        console.log(chalk.green('🤖 Pod 042: [肯定] Menu 配置同步成功。'))
    })

    // 监听 screenShot 目录
    const watcher = chokidar.watch('./screenShot', {
        persistent: true, // 持续监听
        ignored: /(^|[\/\\])\../, // 忽略隐藏文件
        awaitWriteFinish: { // 等待文件写入完成
            stabilityThreshold: 500, // 稳定性阈值（毫秒）
            pollInterval: 100 // 轮询间隔
        }
    })

    // 文件添加事件
    watcher.on('add', filePath => {
        queue.add(async () => {
            const startTime = Date.now()
            const mockDir = path.join(process.cwd(), 'mock')
            const fileName = path.basename(filePath, path.extname(filePath))
            const targetDir = path.join(process.cwd(), config.pagesDir, fileName)
            const spinner = ora(chalk.cyan(`🤖 Pod 042: [报告] 捕获到新的视觉图像 [${fileName}]，开始执行构筑程序...`))
            spinner.start()
            try {
                // 创建必要的目录
                if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

                // 1. 识别页面结构（调用视觉大模型）
                const pageConfig = await recognizePage(pagePrompt, filePath)

                // 2. 生成 resource.js（表格列、表单配置、字典等）
                fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig, resourceTpl }))

                // 3. 生成 index.js（页面组件）
                fs.writeFileSync(path.join(targetDir, 'index.js'), index({ fileName, indexTpl, pageConfig }))

                // 4. 如果是新页面，添加到菜单配置
                if (!menus.find(m => m.key === fileName)) {
                    menus.push({ label: fileName, key: fileName })
                }

                // 5. 生成 Mock 数据（可选）
                if (config.needMock) {
                    console.log(chalk.yellow(`🧑‍💻 9S: 交给我吧 2B！正在骇入并伪造 [${fileName}] 的 Mock 数据...`))
                    const rawContent = await generateMock(pageConfig.table.columns, fileName)
                    // 格式化 Mock 数据
                    fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${stringify.default(rawContent, { indent: 4, maxLength: 200 })}`.replaceAll(`"'`, `"`).replaceAll(`'"`, `"`))
                    console.log(chalk.green(`🤖 Pod 042: [报告] Mock 数据注入完成，耗时: ${(Date.now() - startTime) / 1000} 秒`))
                }

                const endTime = Date.now()
                //fs.unlinkSync(filePath) // 可选：处理完成后删除截图
                spinner.succeed(chalk.green(`🤖 Pod 042: [报告] 模块 [${fileName}] 物理装配完成！耗时 ${(endTime - startTime) / 1000} 秒`))
            } catch (error) {
                spinner.fail(chalk.red(`🤖 Pod 042: [警告] 模块 [${fileName}] 构筑失败。原因：${error}`))
            }
        })
    })
}

module.exports = watchPage
