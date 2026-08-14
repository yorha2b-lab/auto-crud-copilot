module.exports = ({ units, yorha, dialog, logistics, headquarters }) => {

    const http = require('http')
    const zlib = require('zlib')
    const httpProxy = require('http-proxy')

    const { pod153, commander } = yorha
    const { unwrapSignal, isQuerySignal } = logistics.analyzer
    const { routeMap = {}, proxyTarget } = logistics.supporter.getConfig()

    const TOWER_PORT = 42153
    const hackedRegistry = new Map()
    const proxy = httpProxy.createProxyServer({})

    const getJsonFingerprint = obj => {
        if (!obj || typeof obj !== 'object') return ''
        return Object.keys(Array.isArray(obj) ? (obj[0] || {}) : obj).sort().join(',')
    }

    proxy.on('proxyRes', function (proxyRes, req, res) {
        let body = []
        proxyRes.on('data', chunk => body.push(chunk))
        proxyRes.on('end', async () => {
            const buffer = Buffer.concat(body)
            const encoding = proxyRes.headers['content-encoding']
            try {
                const rawBody = encoding === 'gzip' ? zlib.gunzipSync(buffer) : buffer
                const json = JSON.parse(rawBody.toString())
                const coreData = unwrapSignal(json)
                if (!isQuerySignal(req, json, coreData) || coreData?.length === 0) {
                    return
                }
                const referer = req.headers.referer || '/'
                const urlPath = new URL(referer).pathname
                const fileName = routeMap?.[urlPath] ?? urlPath.split('/').filter(Boolean).at(-1)
                const fingerprint = getJsonFingerprint(coreData)
                const lastFingerprint = hackedRegistry.get(fileName)
                if (lastFingerprint === fingerprint) {
                    return
                }
                pod153.report(dialog.pod153.capturedRuntimeSignal(fileName))
                await headquarters.reconciler({ fileName, data: [coreData[0]] })
                hackedRegistry.set(fileName, fingerprint)
            } catch (e) {
                // 非 JSON 信号，保持静默
            }
        })
    })

    const server = http.createServer((req, res) => {
        if (!proxyTarget) {
            return
        }
        proxy.web(req, res, { target: proxyTarget, changeOrigin: true })
    })

    server.listen(TOWER_PORT, () => {
        commander.report(dialog.bunker.towerOnline(TOWER_PORT), 'magenta')
        commander.report(dialog.bunker.towerConnected(TOWER_PORT), 'magenta')
    })

    return server
}