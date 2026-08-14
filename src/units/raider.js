const fs = require('fs')

module.exports = {
    meta: {
        name: 'raider',
        inputs: ['image'],
        outputs: ['component-config'],
        description: 'extract reusable UI component from visual input',
        capabilities: ['vision', 'component-analysis', 'component-generation'],
    },
    execute: async ({ acp, mission }) => {

        const chalk = require('chalk')
        const { llm, yorha, dialog, builder, logistics, briefings } = acp

        const { pod042 } = yorha
        const { raider } = briefings
        const { recognizePage } = llm
        const { formatFormItemAndColumns } = builder
        const { cleanCode, contextStringify } = logistics.builder

        const startTime = Date.now()

        const spinner = pod042.start(dialog.pod042.visualPartCaptured)

        try {
            pod042.update(spinner, dialog.pod042.extractingUiMetadata)

            const pageConfig = await recognizePage({ prompt: raider, filePath: mission.input })

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
            console.log(chalk.magenta(`│ Source: ${mission.input}`))
            console.log(chalk.magenta(`│ Protocol: Partial UI Fragment | Status: SUCCESS`))
            console.log(chalk.magenta(`├──────────────────────────────────────────────────────────────────┘`))
            console.log(chalk.white(finalResult))
            pod042.success(spinner, dialog.pod042.partialConstruction((endTime - startTime) / 1000))
            pod042.success(spinner, dialog.pod042.partialRecommendation)

            if (fs.existsSync(mission.input)) {
                fs.unlinkSync(mission.input)
            }

        } catch (error) {
            pod042.fail(spinner, dialog.pod042.partialConstructionAborted(error))
        }
    }
}