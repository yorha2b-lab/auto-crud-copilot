const fs = require('fs')
const path = require('path')

let instance = null

module.exports = {

    init: ({ template }, dialog) => {

        const yorha = require('./yorha')()

        const generatorPath = path.join(__dirname, `../framework/${template}/generator`)
        if (!fs.existsSync(generatorPath)) {
            yorha.commander.report(dialog.bunker.frameworkNotSupported(template), 'red')
            return
        }

        const foundation = require('../utils/foundation')
        const config = foundation.getConfig()

        const accessPoint = {
            yorha,
            config,
            dialog,
            template,
            foundation,
            openAI: require('./openai')(),
            core: require('../utils/core'),
            menus: foundation.getExistingMenus(),
            handlebars: require('./handlebar')({ config, template, ...foundation }),
            handlers: require('./registry')({ dir: path.join(__dirname, '../handlers') }),
            prompts: require('./registry')({ dir: path.join(__dirname, `../framework/${template}/prompts`) }),
        }

        require('./foundation')(accessPoint)
        const llm = require('../services/llm')(accessPoint)
        const generator = require(generatorPath)(accessPoint)
        const labs = require('./labs')({ llm, ...accessPoint })


        instance = { llm, labs, generator, ...accessPoint }
        return instance
    },

    get: () => {
        return new Proxy({}, {
            get(target, prop) {
                if (!instance) {
                    throw new Error()
                }
                return instance[prop]
            }
        })
    },

    reboot() {
        const { template, dialog } = instance
        delete require.cache[require.resolve(path.join(process.cwd(), 'config.js'))]
        instance.labs?.shutdown?.()
        instance = null
        return this.init({ template }, dialog)
    }
}