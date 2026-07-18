const fs = require('fs')
const path = require('path')

module.exports = {
    watch: 'screenShot',
    async handle(filePath) {

        const { llm, menus, yorha, dialog, config, prompts, generator, foundation } = require('../bootstrap').get()

        const { page } = prompts
        const { nineS, pod042 } = yorha
        const { index, resource } = generator
        const { contextStringify } = foundation
        const { generateMock, recognizePage } = llm
        const { useDemo, pagesDir, needMock } = config


        const startTime = Date.now()
        const fileName = path.basename(filePath, path.extname(filePath))
        const mockDir = path.join(process.cwd(), 'mock')
        const targetDir = path.join(process.cwd(), pagesDir, fileName)

        const spinner = pod042.start(dialog.pod042.visualCaptured(fileName))

        try {
            if (fs.existsSync(targetDir)) {
                pod042.warning(spinner, dialog.pod042.intercept(fileName))
                return
            }

            if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

            let pageConfig
            if (useDemo) {
                pod042.report(dialog.pod042.simulate)
                pageConfig = require('../../example/example.json')
            } else {
                pod042.update(spinner, dialog.pod042.uploadVisualMetadata)
                pageConfig = await recognizePage({ prompt: page(fileName), filePath })
            }

            fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig }))
            fs.writeFileSync(path.join(targetDir, 'index.js'), index({ fileName, pageConfig }))

            if (!menus.find(m => m.key === fileName)) {
                menus.push({ label: fileName, key: fileName })
            }

            if (needMock) {
                nineS.update(spinner, dialog.nineS.dataCamouflage(fileName))
                const rawContent = await generateMock({ columns: pageConfig.table.columns, fileName })
                fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${contextStringify({ context: rawContent })}`)
                nineS.success(spinner, dialog.nineS.dataCamouflageComplete)
            }

            const endTime = Date.now()
            pod042.success(spinner, dialog.pod042.assemblyComplete(fileName, (endTime - startTime) / 1000))

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }

        } catch (error) {
            pod042.fail(spinner, dialog.pod042.constructionAborted(error))
        }
    }
}