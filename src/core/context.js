const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const OpenAI = require('openai')
const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')

const contextStringify = ({ context, indent = 4, maxLength = 200 }) => stringify.default(context, { indent, maxLength })

Handlebars.registerHelper('raw', opt => opt.fn())
Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(contextStringify({ context, maxLength })) : '[]')

let instance = null

module.exports = {

    init: options => {

        const template = options.template
        const uxCtx = require('../utils/ux')
        const coreCtx = require('../utils/core')
        const infrastructureCtx = require('../utils/infrastructure')

        const { language } = uxCtx
        const { getConfig, getExistingMenus, copyTemplateDir } = infrastructureCtx

        const config = getConfig()
        const { hbsDir, hooksDir, utilsDir, componentsDir } = config

        const menus = getExistingMenus()
        const apiHandler = require('../commands/handlers/api-handler')
        const pageHandler = require('../commands/handlers/page-handler')
        const partHandler = require('../commands/handlers/part-handler')
        const tplDir = hbsDir !== '' ? path.join(process.cwd(), hbsDir) : path.join(__dirname, `../../templates/${template}`)

        const compilerPath = path.join(__dirname, `./${template}-compiler.js`)
        if (!fs.existsSync(compilerPath)) {
            console.error(chalk.red(language(`❌ 暂不支持 [${template}] 框架。欢迎提交 Pull Request 贡献。`, `❌ [${template}] framework not supported. Welcome to contribute a Pull Request to help.`)))
            return
        }

        try {
            if (hbsDir === '') {
                copyTemplateDir(options, 'hooks', hooksDir)
                copyTemplateDir(options, 'utils', utilsDir)
                copyTemplateDir(options, 'components', componentsDir)
            }
        } catch (error) {
            console.error(language('❌ 模板构筑失败:', '❌ Template construction failed:'), error)
        }

        const partialsDir = hbsDir !== '' ? path.join(process.cwd(), hbsDir, 'handlebars') : path.join(__dirname, `../../templates/${template}/handlebars`)
        fs.readdirSync(partialsDir).forEach(file => {
            if (file.endsWith('.hbs')) {
                const name = path.basename(file, '.hbs') // 去掉后缀拿名字
                const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8')
                Handlebars.registerPartial(name, `${content}\n`)
            }
        })

        const promptCtx = {
            mockPrompt: require(`../prompts/mock.js`),
            sysPrompt: require(`../prompts/system.js`),
            apiPrompt: require(`../prompts/${template}/watch-api.js`),
            pagePrompt: require(`../prompts/${template}/watch-page.js`),
            partPrompt: require(`../prompts/${template}/watch-part.js`),
            linkerPrompt: require(`../prompts/${template}/api-linker.js`),
        }

        const hbsTplCtx = {
            indexTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8')),
            resourceTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8')),
        }

        const pkgEnv = path.resolve(__dirname, '../.env')
        const localEnv = path.resolve(process.cwd(), '.env')
        require('dotenv').config({ path: fs.existsSync(localEnv) ? localEnv : pkgEnv })
        const openAI = new OpenAI({ apiKey: process.env.API_KEY, baseURL: process.env.BASE_URL })

        const cliCtx = { options }
        const handlerCtx = { apiHandler, pageHandler, partHandler }
        const finalInfrastructureCtx = { menus, config, ...infrastructureCtx }
        const llmCtx = require('../services/llm')({ config, openAI, template, ...promptCtx })
        const compileCtx = require(compilerPath)({ config, contextStringify, ...coreCtx, ...hbsTplCtx })

        instance = {
            openAI,
            ...uxCtx,
            ...cliCtx,
            ...llmCtx,
            ...coreCtx,
            ...promptCtx,
            ...hbsTplCtx,
            ...handlerCtx,
            ...compileCtx,
            contextStringify,
            ...finalInfrastructureCtx,
        }
        return instance
    },

    get: () => instance
}