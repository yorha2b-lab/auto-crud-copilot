const fs = require('fs')
const path = require('path')

module.exports = dir => Object.fromEntries(fs.readdirSync(dir).filter(file => file.endsWith('.js')).map(file => [path.basename(file, '.js'), require(path.join(dir, file))]))