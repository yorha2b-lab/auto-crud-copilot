const http = require('http')
const zlib = require('zlib')
const chalk = require('chalk')
const httpProxy = require('http-proxy')
const { get } = require('../core/context')

/**
 * @function startProxyTower
 * @description [地堡 42153 联合波段] 启动流量拦截塔。
 * 独立运行于后台，监听 42153 端口，物理截获联调过程中的 JSON 信号并触发语义对齐。
 */
module.exports = () => {

    const { config, language, apiHandler, unwrapSignal, isQuerySignal } = get()

    const TOWER_PORT = 42153
    const hackedRegistry = new Map()
    const proxy = httpProxy.createProxyServer({})


    // 简单的辅助函数：提取 JSON 的所有 Key 作为“指纹”
    const getJsonFingerprint = obj => {
        if (!obj || typeof obj !== 'object') return ''
        return Object.keys(Array.isArray(obj) ? (obj[0] || {}) : obj).sort().join(',')
    }

    const server = http.createServer((req, res) => {

        const target = config.proxyTarget

        if (!target) {
            // 静默模式：如果不配置 proxyTarget，拦截塔只转发不处理（或报错提示）
            return
        }

        // 💡 物理监控：劫持响应流
        proxy.on('proxyRes', function (proxyRes, req, res) {
            let body = []
            proxyRes.on('data', chunk => body.push(chunk))
            proxyRes.on('end', async () => {
                const buffer = Buffer.concat(body)
                const encoding = proxyRes.headers['content-encoding']
                try {
                    const rawBody = encoding === 'gzip' ? zlib.gunzipSync(buffer) : buffer
                    const json = JSON.parse(rawBody.toString())

                    const coreData = unwrapSignal(json) // 先脱水

                    // 💡 这一步就是地堡的“火控系统”
                    if (!isQuerySignal(req, json, coreData)) {
                        return // 增删改信号，直接丢弃，保持静默
                    }

                    const referer = req.headers.referer || ''
                    const fileName = referer.split('?')[0].split('/').filter(Boolean).at(-1)

                    const fingerprint = getJsonFingerprint(unwrapSignal(json)) // 获取数据指纹
                    const lastFingerprint = hackedRegistry.get(fileName)

                    // 如果指纹没变，说明字段结构是一样的，无需再次骇入
                    if (lastFingerprint === fingerprint) {
                        return
                    }

                    console.log(chalk.cyan(language(
                        `\n📡 Pod 153: 截获运行时信号 [${fileName}]。执行自动对齐协议...`,
                        `\n📡 Pod 153: Captured runtime signal [${fileName}]. Executing semantic alignment protocol...`
                    )))
                    // 💡 直接调用 api-handler 物理更新 resource.js
                    await apiHandler(null, { fileName, data: json })
                    hackedRegistry.set(fileName, fingerprint)
                } catch (e) {
                    console.log(e)
                    // 非 JSON 信号，保持静默
                }
            })
        })
        // 转发至真实后端
        proxy.web(req, res, { target, changeOrigin: true })
    })

    server.listen(TOWER_PORT, () => {
        console.log(chalk.magenta(language(
            `✨ YoRHa 联合基站：信号拦截塔已在线 [波段: ${TOWER_PORT}]`,
            `✨ YoRHa Joint Station: Signal Intercept Tower Online [Band: ${TOWER_PORT}]`
        )))
        console.log(chalk.gray(language(
            `💡 指令：请将您的代理目标指向 http://localhost:${TOWER_PORT}`,
            `💡 Command: Please point your local proxy target to http://localhost:${TOWER_PORT}`
        )))
    })
}