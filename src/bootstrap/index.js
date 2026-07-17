const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

let instance = null

module.exports = {

    init: options => {

        const template = options.template
        const ux = require('../utils/ux')

        const generatorPath = path.join(__dirname, `../framework/${template}/generator`)
        if (!fs.existsSync(generatorPath)) {
            console.error(chalk.red(ux.language(`❌ 暂不支持 [${template}] 框架。欢迎提交 Pull Request 贡献。`, `❌ [${template}] framework not supported. Welcome to contribute a Pull Request to help.`)))
            return
        }

        const infrastructure = require('../utils/infrastructure')

        const openAI = require('./openai')()
        const core = require('../utils/core')
        const handlers = require('./handlers')()
        const config = infrastructure.getConfig()
        const menus = infrastructure.getExistingMenus()
        const prompts = require('./prompt')({ template })
        require('./infrastructure')({ ux, config, options, ...infrastructure })
        const llm = require('../services/llm')({ config, openAI, template, ...prompts })
        const handlebars = require('./handlebars')({ config, template, ...infrastructure })
        const generator = require(generatorPath)({ config, ...core, ...handlebars, ...infrastructure })

        instance = {
            ux,
            llm,
            core,
            openAI,
            prompts,
            handlers,
            generator,
            handlebars,
            cli: options,
            infrastructure: { menus, config, ...infrastructure },
        }
        return instance
    },

    get: () => instance
}