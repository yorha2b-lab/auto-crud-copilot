const fs = require('fs')
const path = require('path')

module.exports = {
    watch: 'response',
    async handle(filePath, liveResponse = null) {

        const chalk = require('chalk')
        const { ux, llm, core, yorha, dialogs, infrastructure } = require('../bootstrap').get()

        const { local } = ux
        const dialog = dialogs[local]
        const { unwrapSignal } = core
        const { nineS, pod153 } = yorha
        const { config } = infrastructure
        const { alignResponseFields } = llm

        const { pagesDir } = config
        const startTime = Date.now()
        const fileName = liveResponse?.fileName ?? path.basename(filePath, path.extname(filePath))
        const resourcePath = path.join(process.cwd(), pagesDir, fileName, 'resource.js')

        const spinner = pod153.start(dialog.pod153.reconEncryptedData(fileName))

        try {
            if (!fs.existsSync(resourcePath)) {
                pod153.fail(spinner, dialog.pod153.unknownModule(fileName))
                return
            }

            let rawJson = liveResponse ? liveResponse.data : JSON.parse(fs.readFileSync(filePath, 'utf8'))
            let resourceStr = fs.readFileSync(resourcePath, 'utf8')

            const coreArray = unwrapSignal(rawJson)
            if (!coreArray || coreArray.length === 0) {
                pod153.warning(spinner, dialog.pod153.formatError)
            }

            nineS.update(spinner, dialog.nineS.scanningField)

            const extractKeys = str => {
                const keys = []
                const regex = /(dataIndex|name)\s*:\s*['"]([^'"]+)['"]/g
                let match
                while ((match = regex.exec(str)) !== null) {
                    keys.push(match[2])
                }
                return Array.from(new Set(keys))
            }

            const sampleData = coreArray && coreArray.length > 0 ? [coreArray[0]] : rawJson
            const result = await alignResponseFields({ responseStr: JSON.stringify(sampleData), resourceStr: extractKeys(resourceStr).join(',') })
            let changeCount = 0
            const resultMapping = {}
            Object.entries(result).forEach(([oldField, newField]) => {
                if (oldField === newField) return
                const regex = new RegExp(`(dataIndex|name)\\s*:\\s*['"]${oldField}['"]`, 'g')
                resourceStr = resourceStr.replace(regex, `$1: '${newField}'`)
                changeCount++
                resultMapping[oldField] = newField
            })

            fs.writeFileSync(resourcePath, resourceStr)
            const endTime = Date.now()

            pod153.success(spinner, dialog.pod153.bridgeProtocolComplete(changeCount, (endTime - startTime) / 1000))

            if (changeCount > 0) {
                console.log(chalk.magenta(`\n┌────── [ YoRHa Autonomous Backend Alignment ] ──────┐`))
                const maxOldFieldLength = Math.max(...Object.keys(resultMapping).map(key => key.length))
                Object.entries(resultMapping).forEach(([oldField, newField]) => {
                    const padding = ' '.repeat(Math.max(1, maxOldFieldLength + 1 - oldField.length))
                    console.log(
                        chalk.yellow(` │  `) +
                        chalk.yellow(oldField) +
                        padding +
                        chalk.cyan(` ->  `) +
                        chalk.white(newField)
                    )
                })
                console.log(chalk.magenta(`└────────────────────────────────────────────────────┘`))
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }

        } catch (error) {
            pod153.fail(spinner, dialog.pod153.alignmentFailed(error))
        }
    }
}