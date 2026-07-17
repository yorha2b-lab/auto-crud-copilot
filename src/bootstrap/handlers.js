module.exports = () => {

    const fs = require('fs')
    const path = require('path')

    const handlersPath = path.join(__dirname, `../handlers`)
    const handlers = fs.readdirSync(handlersPath).map(handler => [path.basename(handler, '.js'), require(path.join(handlersPath, handler))])

    return Object.fromEntries(handlers)
}