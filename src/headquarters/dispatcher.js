module.exports = ({ yorha, dialog }, concurrency = 1) => {

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
            yorha.pod153.report(dialog.pod153.signalLinkFault(err.message), 'red')
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