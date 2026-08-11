const fs = require('fs')
const path = require('path')

module.exports = {
    station: 'screenShot',
    async handle(filePath) {

        const { llm, yorha, dialog, prompts, template, generator, logistics } = require('../awakening').get()

        const { page } = prompts
        const { nineS, pod042 } = yorha
        const { index, resource } = generator
        const { contextStringify } = logistics.generator
        const { generateMock, recognizePage, nameSimilarity } = llm
        const { useDemo, pagesDir, utilsDir, needMock } = logistics.foundation.getConfig()


        const startTime = Date.now()
        let fileName = path.basename(filePath, path.extname(filePath))
        let targetDir = path.join(process.cwd(), pagesDir, fileName)

        const spinner = pod042.start(dialog.pod042.visualCaptured(fileName))

        try {
            if (fs.existsSync(targetDir)) {
                pod042.warning(spinner, dialog.pod042.intercept(fileName))
                return
            }

            let pageConfig
            if (useDemo) {
                pod042.report(dialog.pod042.simulate)
                pageConfig = require('../../example/example.json')
            } else {
                pod042.update(spinner, dialog.pod042.uploadVisualMetadata)
                pageConfig = await recognizePage({ prompt: page, filePath, schema: require(`../framework/${template}/schema/page.json`) })
            }

            const { similarity } = await nameSimilarity({ fileName, english: pageConfig.title.english })
            if (similarity === 0) {
                fileName = pageConfig.title.english
                targetDir = path.join(process.cwd(), pagesDir, pageConfig.title.english)
                if (fs.existsSync(targetDir)) {
                    targetDir = `${targetDir}_temp`
                }
            }

            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
            fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig }))
            fs.writeFileSync(path.join(targetDir, 'index.js'), index({ fileName, pageConfig }))

            if (needMock) {
                nineS.update(spinner, dialog.nineS.dataCamouflage(fileName))
                const mockDir = path.join(process.cwd(), 'mock')
                if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
                const rawContent = await generateMock({ columns: pageConfig.table.columns, fileName })
                fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${contextStringify({ context: rawContent })}`)
                nineS.success(spinner, dialog.nineS.dataCamouflageComplete)
            }

            const endTime = Date.now()
            pod042.success(spinner, dialog.pod042.assemblyComplete(fileName, (endTime - startTime) / 1000))

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                const cwdUtilsDir = path.join(process.cwd(), utilsDir)
                if (!fs.existsSync(cwdUtilsDir)) fs.mkdirSync(cwdUtilsDir, { recursive: true })
                fs.writeFileSync(path.join(cwdUtilsDir, 'menus.js'), `export const menus = ${contextStringify({ context: logistics.foundation.getExistingMenus(pagesDir), maxLength: 50 })}`)
            }

        } catch (error) {
            if (fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true, force: true })
            }
            pod042.fail(spinner, dialog.pod042.constructionAborted(error))
        }
    }
}