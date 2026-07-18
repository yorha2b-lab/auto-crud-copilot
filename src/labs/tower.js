/**
 * @function startProxyTower
 * @description [地堡 42153 联合波段] 启动流量拦截塔。
 * 独立运行于后台，监听 42153 端口，物理截获联调过程中的 JSON 信号并触发语义对齐。
 */
module.exports = ({ core, yorha, dialog, config, handlers }) => {

    const http = require('http')
    const zlib = require('zlib')
    const httpProxy = require('http-proxy')

    const { pod153, commander } = yorha
    const { unwrapSignal, isQuerySignal } = core
    const { routeMap = {}, proxyTarget } = config

    const TOWER_PORT = 42153
    const hackedRegistry = new Map()
    const proxy = httpProxy.createProxyServer({})

    // 简单的辅助函数：提取 JSON 的所有 Key 作为“指纹”
    const getJsonFingerprint = obj => {
        if (!obj || typeof obj !== 'object') return ''
        return Object.keys(Array.isArray(obj) ? (obj[0] || {}) : obj).sort().join(',')
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
                const urlPath = new URL(referer).pathname
                const fileName = routeMap?.[urlPath] ?? urlPath.split('/').filter(Boolean).at(-1)

                const fingerprint = getJsonFingerprint(unwrapSignal(json)) // 获取数据指纹
                const lastFingerprint = hackedRegistry.get(fileName)

                // 如果指纹没变，说明字段结构是一样的，无需再次骇入
                if (lastFingerprint === fingerprint) {
                    return
                }

                pod153.report(dialog.pod153.capturedRuntimeSignal(fileName))
                // 💡 直接调用 api-handler 物理更新 resource.js
                await handlers.api.handle(null, { fileName, data: json })
                hackedRegistry.set(fileName, fingerprint)
            } catch (e) {
                // 非 JSON 信号，保持静默
                console.log(e)
            }
        })
    })

    const server = http.createServer((req, res) => {
        if (!proxyTarget) {
            // 静默模式：如果不配置 proxyTarget，拦截塔只转发不处理（或报错提示）
            return
        }
        // 转发至真实后端
        proxy.web(req, res, { target: proxyTarget, changeOrigin: true })
    })

    server.listen(TOWER_PORT, () => {
        commander.report(dialog.bunker.towerOnline('42153'), 'magenta')
        commander.report(dialog.bunker.towerConnected('42153'), 'magenta')
    })

    return server
}