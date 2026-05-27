const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
const apiHandler = require('../commands/handlers/api-handler')
const pageHandler = require('../commands/handlers/page-handler')
const partHandler = require('../commands/handlers/part-handler')
const { recognizePage, generateMock, alignResponseFields } = require('../services/llm')
const { language, getConfig, unwrapSignal, isQuerySignal, getExistingMenus } = require('../utils/utils')

let instance = null // 💡 物理封存的全局实例

module.exports = {
    /**
     * @description 执行中枢神经元初始化
     */
    init: options => {

        const config = getConfig()
        const menus = getExistingMenus()
        const template = options.template

        const compilerPath = path.join(__dirname, `./${template}-compiler.js`)
        const { index, resource } = require(compilerPath)

        const tplDir = config.hbsDir !== ''
            ? path.join(process.cwd(), config.hbsDir)
            : path.join(__dirname, `../../templates/${template}`)

        instance = {
            resource, index, template,
            apiHandler, pageHandler, partHandler,
            recognizePage, generateMock, alignResponseFields,
            pagePrompt: require(`../prompts/${template}/watch-page.js`),
            partPrompt: require(`../prompts/${template}/watch-part.js`),
            menus, config, options, language, unwrapSignal, isQuerySignal,
            indexTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8')),
            resourceTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8')),
        }
        return instance
    },

    /**
     * @description 全频道信号接入：获取全局上下文
     */
    get: () => {
        if (!instance) {
            throw new Error(language('🤖 Pod 042 报警：中枢神经元尚未初始化，无法建立信号连接。', '🤖 Pod 042 Warnning：Central neuron not initialized, cannot establish signal connection.'))
        }
        return instance
    }
}