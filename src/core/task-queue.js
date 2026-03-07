const createTaskQueue = (concurrency = 1) => {

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
            console.error('任务执行异常:', err)
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

module.exports = { createTaskQueue }