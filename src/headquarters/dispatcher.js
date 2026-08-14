module.exports = (acp, concurrency = 1) => {

    let running = 0
    let queue = []
    let onIdleCallback = null

    const next = async () => {

        if (running >= concurrency || queue.length === 0) return

        const task = queue.shift()
        running++

        try {
            await task()
        } catch (err) {
            acp.yorha.pod153.report(acp.dialog.pod153.signalLinkFault(err.message), 'red')
        } finally {
            running--
            next()
            if (running === 0 && queue.length === 0 && onIdleCallback) {
                onIdleCallback()
            }
        }
    }

    return {
        add: (task) => {
            queue.push(task)
            next()
        },
        onIdle: (callback) => {
            onIdleCallback = callback
        }
    }
}