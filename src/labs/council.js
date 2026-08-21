module.exports = async ({ llm, yorha, dialog, logistics }) => {

    const fs = require('fs')
    const path = require('path')

    const { apiParser } = llm
    const { pod153, commander } = yorha
    const { contextStringify } = logistics.formatter
    const { apiDoc, pagesDir } = logistics.supporter.getConfig()
    const { getLocalScore, getSemanticKeywords } = logistics.analyzer

    if (!apiDoc) return

    pod153.report(dialog.pod153.autonomousAddressing, 'magenta')

    try {
        const apiData = await fetch(apiDoc).then(res => res.json())
        const refinedApis = Object.entries(apiData.paths).flatMap(([apiUrl, methods]) => {
            return Object.entries(methods).map(([method, info]) => ({
                path: apiUrl,
                method: method?.toUpperCase() || '',
                desc: info.summary || info.description || 'N/A',
            }))
        })

        const pages = path.join(process.cwd(), pagesDir)
        const files = fs.readdirSync(pages)
        const enumParamsMap = {}

        for (const fileName of files) {
            const indexPath = path.join(pages, fileName, 'index.js')
            const resourcePath = path.join(pages, fileName, 'resource.js')

            if (fs.existsSync(indexPath) && fs.existsSync(resourcePath)) {
                let indexCode = fs.readFileSync(indexPath, 'utf-8')

                if (indexCode.includes('BUNKER_API_ANCHOR')) {
                    const resourceCode = fs.readFileSync(resourcePath, 'utf-8')
                    const bunkerAnchors = indexCode.match(/BUNKER_API_ANCHOR_\w+/g)?.join('\n') ?? ''

                    const returnMatch = indexCode.match(/return\s*\(([\s\S]*?)\)\s*}/)
                    const returnStatement = returnMatch ? returnMatch[0] : ''

                    const moduleSemantics = `${returnStatement}${resourceCode}`.match(/[\u4e00-\u9fa5][\u4e00-\u9fa5A-Za-z0-9？。，、：；！（） ]*/g) || []
                    const pageKeywords = getSemanticKeywords(moduleSemantics)
                    const candidates = refinedApis
                        .map(api => ({
                            ...api,
                            score: getLocalScore(api, pageKeywords, fileName)
                        }))
                        .filter(item => item.score > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 20)

                    const finalCandidates = candidates.map(item => `${item.method} ${item.path} ${item.desc}`).join('\n')
                    const spinner = pod153.start(dialog.pod153.inactiveModule(fileName), 'yellow')
                    const result = await apiParser({ bunkerAnchors, realApis: finalCandidates })

                    if (result) {
                        let hasQsImport = indexCode.includes(`import qs from 'qs'`)
                        Object.entries(result).forEach(([anchor, { uri, method }]) => {
                            const cleanPath = uri.startsWith('/') ? uri : `/${uri}`
                            let finalUri = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`
                            finalUri = finalUri.replace(/\{(\w+)\}/g, (_, key) => '${params.' + key + '}')
                            const quotationMark = finalUri.includes('${params.') ? '\`' : "'"
                            if (method?.toUpperCase() === 'GET') {
                                indexCode = indexCode.replaceAll(anchor, `request(\`${finalUri}?\${qs.stringify(params)}\`)`)
                                if (!hasQsImport) {
                                    indexCode = `import qs from 'qs'\n${indexCode}`
                                    hasQsImport = true
                                }
                            } else {
                                indexCode = indexCode.replaceAll(anchor, `request(${quotationMark}${finalUri}${quotationMark}, { method: '${method?.toUpperCase()}', body: params })`)
                            }
                        })

                        const { uri: pagesApi, method: pagesMethod } = result?.['BUNKER_API_ANCHOR_pages']
                        const definitions = (apiData.paths[pagesApi]?.[pagesMethod] ?? apiData.paths[pagesApi]?.[pagesMethod?.toLowerCase()])?.parameters?.flatMap(item => Object.values(item.schema ?? {})?.flatMap(def => def?.split('/')?.at(-1))) || []
                        const parameters = apiData.definitions?.[definitions[0]]?.properties ?? {}
                        const enumParams = Object.entries(parameters)?.filter(([_, value]) => value.hasOwnProperty('enum')) || []
                        enumParamsMap[fileName] = contextStringify({
                            maxLength: 100,
                            context: Object.fromEntries(enumParams.map(([key, value]) => [`${key}Options`, value.enum?.map(opt => ({ label: opt, value: opt }))])),
                        })

                        fs.writeFileSync(indexPath, indexCode)
                        pod153.success(spinner, dialog.pod153.signalSynchronized(Object.keys(result).length))
                        // 💡 战术免责补丁：采用橙黄色高亮，提醒指挥官保持警惕
                        commander.report(dialog.bunker.disclaimer, 'yellow')
                    }
                }
            }
        }

        return enumParamsMap
    } catch (e) {
        pod153.report(dialog.pod153.signalLinkFault(e.message), 'red')
    }
}