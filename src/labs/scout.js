const fs = require('fs')
const path = require('path')

let globalBrowser = null

module.exports = ({ yorha, dialog }) => {

    const { pod042 } = yorha

    const isHttpURL = str => {
        try {
            const url = new URL(str)
            return ['http:', 'https:'].includes(url.protocol)
        } catch {
            return false
        }
    }

    const derivePageNameFromUrl = rawUrl => {
        const parsed = new URL(rawUrl)
        let routePath = parsed.hash ? parsed.hash.replace(/^#/, '') : parsed.pathname
        routePath = routePath.split('?')[0].replace(/^\/+|\/+$/g, '')
        if (!routePath) return 'Home'
        const parts = routePath.split(/[/\-_]/).filter(Boolean)
        return parts.at(-1) ?? 'capturedPage'
    }

    return {
        archeology: async targetUrl => {

            if (!isHttpURL(targetUrl)) {
                return
            }

            pod042.report(dialog.pod042.startScout, 'green')

            const puppeteer = require('puppeteer')
            const screenshotDir = path.join(process.cwd(), 'bunker', 'screenShot')
            const sessionDir = path.join(process.cwd(), 'bunker', '.chrome_session')

            let isBrowserAlive = false
            if (globalBrowser) {
                try {
                    await globalBrowser.pages()
                    isBrowserAlive = true
                } catch (e) {
                    globalBrowser = null
                }
            }

            if (!isBrowserAlive) {

                ['SingletonLock', 'SingletonSocket', 'SingletonCookie'].forEach(file => {
                    try { fs.unlinkSync(path.join(sessionDir, file)) } catch (e) { }
                })

                globalBrowser = await puppeteer.launch({
                    headless: false,
                    handleSIGINT: false,
                    defaultViewport: null,
                    userDataDir: sessionDir,
                    args: ['--start-maximized']
                })
            }

            const pages = await globalBrowser.pages()
            const page = pages.length > 0 ? pages[0] : await globalBrowser.newPage()

            try {
                await page.exposeFunction('nodeTakeScreenshot', async () => {
                    const currentUrl = await page.url()
                    const pageName = derivePageNameFromUrl(currentUrl)
                    const savePath = path.join(screenshotDir, `${pageName}.png`)
                    await page.screenshot({ path: savePath, fullPage: true })
                    pod042.report(dialog.pod042.capturedPage(pageName), 'green')
                })

                await page.evaluateOnNewDocument(() => {
                    if (window.__hasBunkerListener__) return
                    window.__hasBunkerListener__ = true
                    window.addEventListener('contextmenu', (e) => {
                        e.preventDefault()
                        if (window.nodeTakeScreenshot) {
                            window.nodeTakeScreenshot()
                        }
                        const toast = document.createElement('div')
                        toast.innerText = dialog.pod042.capturedToast
                        toast.style.cssText = `
                            position: fixed; top: 20px; right: 20px; z-index: 999999;
                            background: rgba(0, 0, 0, 0.85); color: #00ffcc;
                            border: 1px solid #00ffcc; padding: 12px 24px;
                            font-size: 15px; font-family: monospace; border-radius: 4px;
                            box-shadow: 0 0 15px rgba(0, 255, 204, 0.5);
                            pointer-events: none; transition: opacity 0.4s ease;
                        `
                        document.body.appendChild(toast)
                        setTimeout(() => {
                            toast.style.opacity = '0'
                            setTimeout(() => toast.remove(), 400)
                        }, 1200)
                    })
                })
            } catch (error) { }

            await page.goto(targetUrl)
            pod042.report(dialog.pod042.scoutReady, 'green')
            return globalBrowser
        }
    }
}