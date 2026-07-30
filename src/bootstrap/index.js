const fs = require('fs')
const path = require('path')

let instance = null

module.exports = {

    init: async ({ template }, dialog, version, local) => {

        const recruiter = require('../kernel/recruiter')
        const utils = recruiter(path.join(__dirname, '../utils'))
        const yorha = utils.ux.yorha()

        const generatorPath = path.join(__dirname, `../framework/${template}/generator`)
        if (!fs.existsSync(generatorPath)) {
            yorha.commander.report(dialog.bunker.frameworkNotSupported(template), 'red')
            return
        }

        const accessPoint = {
            utils,
            yorha,
            dialog,
            template,
            openAI: require('../ai/openai')(),
            engine: require('../kernel/engine')({ utils, template }),
            handlers: recruiter(path.join(__dirname, '../handlers')),
            prompts: recruiter(path.join(__dirname, `../framework/${template}/prompts`)),
        }

        if (version) {
            await utils.ux.bootSequence(version, local)
        }
        require('../kernel/deployment')(accessPoint)
        const llm = require('../ai')(accessPoint)
        const generator = require(generatorPath)(accessPoint)
        const labs = require('../labs')({ llm, ...accessPoint })


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
        delete require.cache[require.resolve(path.join(process.cwd(), 'bunker', 'config.js'))]
        instance.labs?.tower?.close()
        instance = null
        return this.init({ template }, dialog)
    }
}