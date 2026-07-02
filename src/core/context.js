const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')

Handlebars.registerHelper('raw', options => options.fn())
Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(stringify.default(context, { indent: 4, maxLength })) : '[]')

let instance = null // 💡 物理封存的全局实例

module.exports = {
    /**
     * @description 执行中枢神经元初始化
     */
    init: options => {

        const { recognizePage, generateMock, alignResponseFields } = require('../services/llm')
        const { language, getConfig, unwrapSignal, isQuerySignal, getExistingMenus } = require('../utils/utils')

        const config = getConfig()
        const menus = getExistingMenus()
        const template = options.template
        const apiHandler = require('../commands/handlers/api-handler')
        const pageHandler = require('../commands/handlers/page-handler')
        const partHandler = require('../commands/handlers/part-handler')
        const tplDir = config.hbsDir !== '' ? path.join(process.cwd(), config.hbsDir) : path.join(__dirname, `../../templates/${template}`)

        const compilerPath = path.join(__dirname, `./${template}-compiler.js`)
        if (!fs.existsSync(compilerPath)) {
            console.error(chalk.red(language(`❌ 暂不支持 [${template}] 框架。欢迎提交 Pull Request 贡献。`, `❌ [${template}] framework not supported. Welcome to contribute a Pull Request to help.`)))
            return
        }
        const { index, resource } = require(compilerPath)

        // 💡 物理扫描：把目录下所有的 .hbs 文件全部识别并自动注册
        const partialsDir = config.hbsDir !== ''
            ? path.join(process.cwd(), config.hbsDir, 'handlebars')
            : path.join(__dirname, `../../templates/${template}/handlebars`)
        fs.readdirSync(partialsDir).forEach(file => {
            if (file.endsWith('.hbs')) {
                const name = path.basename(file, '.hbs') // 去掉后缀拿名字
                const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8')
                Handlebars.registerPartial(name, `${content}\n`)
            }
        })

        const cliCtx = {
            options,
            template,
        }

        const llmCtx = {
            generateMock,
            recognizePage,
            alignResponseFields
        }

        const utilsCtx = {
            menus,
            config,
            language,
            unwrapSignal,
            isQuerySignal,
        }

        const handlerCtx = {
            apiHandler,
            pageHandler,
            partHandler
        }

        const compileCtx = {
            index,
            resource
        }

        const promptCtx = {
            pagePrompt: require(`../prompts/${template}/watch-page.js`),
            partPrompt: require(`../prompts/${template}/watch-part.js`),
        }

        const templateCtx = {
            indexTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8')),
            resourceTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8')),
        }


        instance = {
            ...cliCtx,
            ...llmCtx,
            ...utilsCtx,
            ...promptCtx,
            ...handlerCtx,
            ...compileCtx,
            ...templateCtx,
        }
        return instance
    },

    /**
     * @description 全频道信号接入：获取全局上下文
     */
    get: () => instance
}