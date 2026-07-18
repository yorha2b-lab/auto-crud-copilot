module.exports = ({ dir }) => {

    const fs = require('fs')
    const path = require('path')

    return Object.fromEntries(
        fs.readdirSync(dir)
            .filter(file => file.endsWith('.js'))
            .map(file => [
                path.basename(file, '.js'),
                require(path.join(dir, file))
            ])
    )
}