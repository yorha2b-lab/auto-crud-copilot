const fs = require('fs')
const path = require('path')

let instance = null

module.exports = {

    init: async ({ template }, dialog, version, local) => {

        const recruiter = require('../headquarters/recruiter')
        const logistics = recruiter(path.join(__dirname, '../logistics'))
        const yorha = logistics.ux.yorha()

        const generatorPath = path.join(__dirname, `../framework/${template}/generator`)
        if (!fs.existsSync(generatorPath)) {
            yorha.commander.report(dialog.bunker.frameworkNotSupported(template), 'red')
            return
        }

        const accessPoint = {
            yorha,
            dialog,
            template,
            logistics,
            units: recruiter(path.join(__dirname, '../units')),
            builder: require('../headquarters/builder')({ logistics, template }),
            prompts: recruiter(path.join(__dirname, `../framework/${template}/prompts`)),
        }

        if (version) {
            await logistics.ux.bootSequence(version, local)
        }
        require('../headquarters/engineer')(accessPoint)
        const llm = require('../gateway')(accessPoint)
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