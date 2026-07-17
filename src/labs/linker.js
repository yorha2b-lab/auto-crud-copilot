module.exports = async () => {

    const fs = require('fs')
    const path = require('path')
    const chalk = require('chalk')

    const { ux, llm, infrastructure } = require('../bootstrap').get()

    const { language } = ux
    const { apiLinker } = llm
    const { config, getLocalScore, getSemanticKeywords, } = infrastructure

    const { apiDoc, pagesDir } = config
    if (!apiDoc) return

    console.log(chalk.cyan(language(
        `\n🤖 Pod 153: 启动‘全频道自动寻址协议 [语义扫描版]’...`,
        `\n🤖 Pod 153: Initiating 'Full-Channel Autonomous Addressing Protocol [Semantic Scan]'...`
    )))

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

        for (const fileName of files) {
            const indexPath = path.join(pages, fileName, 'index.js')
            const resourcePath = path.join(pages, fileName, 'resource.js')

            if (fs.existsSync(indexPath) && fs.existsSync(resourcePath)) {
                let indexCode = fs.readFileSync(indexPath, 'utf-8')

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

                    console.log(chalk.yellow(language(
                        ` 🛰️  Inactive module: [${fileName}]. Requesting 9S for precise alignment...`,
                        ` 🛰️  发现未通电模块 [${fileName}]，请求 9S 执行高精度对账...`
                    )))

                    // 3. 驱动 9S 最终裁决
                    const result = await apiLinker({ bunkerAnchors, realApis: finalCandidates })

                    if (result) {
                        // 💡 执行物理更替
                        Object.entries(result).forEach(([anchor, fullSignal]) => {
                            // 💡 1. 信号解压
                            const parts = fullSignal.split(' ')
                            const realMethod = parts[0].toUpperCase()
                            const realPath = parts[1]

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
                            indexCode = indexCode.replace(requestRegex, `$1${cleanPath}$2${realMethod}$4`)
                            // 💡 5. 兜底替换（针对没有 method 配置的简易请求）
                            // 同样保留 /api/ 前缀
                            indexCode = indexCode.replaceAll(`/api/${anchor}`, `/api${cleanPath}`)
                        })
                        fs.writeFileSync(indexPath, indexCode)
                        console.log(chalk.green(language(
                            `✅ 信号同步完成，${Object.keys(result).length} 个节点已通电。`,
                            `✅ Signal Synchronized: ${Object.keys(result).length} nodes energized.`
                        )))
                        // 💡 战术免责补丁：采用橙黄色高亮，提醒指挥官保持警惕
                        console.log(chalk.yellow(language(
                            `⚠️ 匹配结果仅供参考，不构成最终决策，各机体需根据实际情况进行调整。`,
                            `⚠️ Match Result Reference Only. Not Final Decision. Each Unit should adjust based on battlefield conditions.`
                        )))
                    }
                }
            }
        }
    } catch (e) {
        console.error(chalk.red(language(
            `\n❌ Pod 153: 信号链路故障: ${e.message}\n`,
            `\n❌ Pod 153: Signal Link Fault: ${e.message}\n`
        )))
    }
}