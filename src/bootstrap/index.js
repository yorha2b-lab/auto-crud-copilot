const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

let instance = null

module.exports = {

    init: (options, dialogs) => {

        const template = options.template
        const ux = require('../utils/ux')

        const generatorPath = path.join(__dirname, `../framework/${template}/generator`)
        if (!fs.existsSync(generatorPath)) {
            console.log(chalk.red(ux.local === 'ZH-CN' ? `暂不支持 [${template}] 框架。欢迎提交 Pull Request 贡献。` : `[${template}] framework not supported. Welcome to contribute a Pull Request to help.`))
            return
        }

        const infrastructure = require('../utils/infrastructure')

        const yorha = require('./yorha')()
        const openAI = require('./openai')()
        const core = require('../utils/core')
        const handlers = require('./handlers')()
        const config = infrastructure.getConfig()
        const menus = infrastructure.getExistingMenus()
        const prompts = require('./prompts')({ template })
        const handlebars = require('./handlebars')({ config, template, ...infrastructure })

        const accessPoint = { ux, yorha, openAI, config, dialogs, options, template, ...core, ...prompts, ...handlebars, ...infrastructure }

        require('./infrastructure')(accessPoint)
        const llm = require('../services/llm')(accessPoint)
        const generator = require(generatorPath)(accessPoint)


        instance = {
            ux,
            llm,
            core,
            yorha,
            openAI,
            prompts,
            dialogs,
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