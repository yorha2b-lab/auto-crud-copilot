const fs = require('fs')
const path = require('path')

module.exports = async ({ llm, core, yorha, dialog, config, foundation }) => {

    const { apiParser } = llm
    const { pod153, commander } = yorha
    const { apiDoc, pagesDir } = config
    const { contextStringify } = foundation
    const { getLocalScore, getSemanticKeywords } = core

    if (!apiDoc) return

    pod153.report(dialog.pod153.autonomousAddressing, 'magenta')

    try {
        // 1. 抓取情报
        const apiData = await fetch(apiDoc).then(res => res.json())
        const refinedApis = Object.entries(apiData.paths).flatMap(([apiUrl, methods]) => {
            // 💡 适配多方法接口：有的路径下可能既有 GET 也有 POST
            return Object.entries(methods).map(([method, info]) => ({
                path: apiUrl,
                method: method.toUpperCase(),
                desc: info.summary || info.description || 'N/A'
            }))
        })

        // 2. 战场侦察
        const pages = path.join(process.cwd(), pagesDir)
        const files = fs.readdirSync(pages)
        const enumParamsMap = {}

        for (const fileName of files) {
            const indexPath = path.join(pages, fileName, 'index.js')
            const resourcePath = path.join(pages, fileName, 'resource.js')

            if (fs.existsSync(indexPath) && fs.existsSync(resourcePath)) {
                let indexCode = fs.readFileSync(indexPath, 'utf-8')
                let resourceCode = fs.readFileSync(resourcePath, 'utf-8')

                // 💡 锁定待通电锚点
                if (indexCode.includes('BUNKER_API_ANCHOR')) {
                    const resourceCode = fs.readFileSync(resourcePath, 'utf-8')
                    const bunkerAnchors = indexCode.match(/BUNKER_API_ANCHOR_\w+/g)?.join('\n') ?? ''

                    // 💡 执行语义提取流程
                    const returnMatch = indexCode.match(/return\s*\(([\s\S]*?)\)\s*}/)
                    const returnStatement = returnMatch ? returnMatch[0] : ''

                    const moduleSemantics = `${returnStatement}${resourceCode}`.match(/[\u4e00-\u9fa5][\u4e00-\u9fa5A-Za-z0-9？。，、：；！（） ]*/g) || []
                    const pageKeywords = getSemanticKeywords(moduleSemantics)
                    // 💡 物理扫描：执行“语义雷达”过滤
                    const candidates = refinedApis
                        .map(api => ({
                            ...api,
                            score: getLocalScore(api, pageKeywords, fileName)
                        }))
                        .filter(item => item.score > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 20) // 💡 拓宽至前 20 名，给 AI 更多的判别空间

                    const finalCandidates = candidates.map(item => `${item.method} ${item.path} ${item.desc}`).join('\n')
                    pod153.report(dialog.pod153.inactiveModule(fileName), 'yellow')
                    // 3. 驱动 9S 最终裁决
                    const result = await apiParser({ bunkerAnchors, realApis: finalCandidates })

                    if (result) {
                        // 💡 执行物理更替
                        Object.entries(result).forEach(([anchor, fullSignal]) => {
                            // 💡 1. 信号解压
                            const [realMethod, realPath] = fullSignal.split(' ')

                            // 💡 2. 路径清洗：确保路径拼接时不产生双斜杠 //
                            // 逻辑：如果 realPath 以 / 开头，咱们拼接时就得小心
                            const cleanPath = realPath.startsWith('/') ? realPath : `/${realPath}`

                            /**
                             * 💡 3. 物理定位正则表达式
                             * 我们把 (request\(\s*['"])\/api\/ 这一段作为第一个捕获组 $1
                             * 这样在替换时，只需在 $1 后面补上新的路径即可，/api/ 会被原样保留！
                             */
                            const requestRegex = new RegExp(`(request\\(\\s*['"]\\/api)${anchor}(['"]\\s*,\\s*\\{[^}]*method\\s*:\\s*['"])(.*?)(['"])`, 'g')

                            // 💡 4. 执行“全频道通电”
                            // $1 现在包含了 request('/api 这一串
                            indexCode = indexCode.replace(requestRegex, `$1${cleanPath}$2${realMethod.toUpperCase()}$4`)
                            // 💡 5. 兜底替换（针对没有 method 配置的简易请求）
                            // 同样保留 /api/ 前缀
                            indexCode = indexCode.replaceAll(`/api/${anchor}`, `/api${cleanPath}`)
                        })

                        const [pagesMethod, pagesApi] = result?.['BUNKER_API_ANCHOR_pages']?.split(' ')
                        const definitions = (apiData.paths[pagesApi]?.[pagesMethod] ?? apiData.paths[pagesApi]?.[pagesMethod.toLowerCase()])?.parameters?.flatMap(item => Object.values(item.schema)?.flatMap(def => def.split('/').at(-1))) || []
                        const parameters = apiData.definitions?.[definitions[0]]?.properties ?? {}
                        const enumParams = Object.entries(parameters)?.filter(([_, value]) => value.hasOwnProperty('enum')) || []
                        enumParamsMap[fileName] = contextStringify({
                            maxLength: 100,
                            context: Object.fromEntries(enumParams.map(([key, value]) => [`${key}Options`, value.enum?.map(opt => ({ label: opt, value: opt }))])),
                        })

                        fs.writeFileSync(indexPath, indexCode)
                        pod153.report(dialog.pod153.signalSynchronized(Object.keys(result).length))
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