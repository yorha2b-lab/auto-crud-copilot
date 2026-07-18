const fs = require('fs')

module.exports = {
    watch: 'screenPart',
    async handle(filePath) {

        const chalk = require('chalk')
        const { ux, llm, core, yorha, dialogs, prompts, infrastructure } = require('../bootstrap').get()

        const { local } = ux
        const { pod042 } = yorha
        const dialog = dialogs[local]
        const { recognizePage } = llm
        const { partPrompt } = prompts
        const { contextStringify } = infrastructure
        const { cleanCode, formatFormItemAndColumns } = core

        const startTime = Date.now()

        const spinner = pod042.start(dialog.pod042.visualPartCaptured)

        try {
            pod042.update(spinner, dialog.pod042.extractingUiMetadata)

            const pageConfig = await recognizePage({ prompt: partPrompt, filePath, taskType: 'part' })

            const { formItems, dictBlocks, processedColumns } = formatFormItemAndColumns({ pageConfig })

            const result = Object.fromEntries(Object.entries({ formItems, processedColumns }).filter(([key, value]) => value?.length > 0))

            let mainConfigStr = cleanCode(contextStringify({ context: result }))

            let optionsCodeStr = ''
            dictBlocks.forEach(key => {
                const optionsArray = pageConfig.optionDict?.[key] ?? []
                const arrayItemsStr = optionsArray.map(opt => `    { label: '${opt.label}', value: '${opt.value}' }`).join(',\n')
                optionsCodeStr += `\nexport const ${key} = [\n${arrayItemsStr}\n]\n`
            })

            const finalResult = `${mainConfigStr}\n${optionsCodeStr}`
            const endTime = Date.now()
            spinner.stop()
            console.log(chalk.magenta(`\n┌────────────────── [ YoRHa Construction Output ] ─────────────────┐`))
            console.log(chalk.magenta(`│ Source: ${filePath}`))
            console.log(chalk.magenta(`│ Protocol: Partial UI Fragment | Status: SUCCESS`))
            console.log(chalk.magenta(`├───────────────────────────────────────────────────────────────────┘`))
            console.log(chalk.white(finalResult))
            pod042.success(spinner, dialog.pod042.partialConstruction((endTime - startTime) / 1000))
            pod042.success(spinner, dialog.pod042.partialRecommendation)

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }

        } catch (error) {
            pod042.fail(spinner, dialog.pod042.partialConstructionAborted(error))
        }
    }
}