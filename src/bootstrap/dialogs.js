module.exports = () => {

    const fs = require('fs')
    const path = require('path')

    const dialogsPath = path.join(__dirname, `../dialogs`)
    const dialogs = fs.readdirSync(dialogsPath).map(dialog => [path.basename(dialog, '.js'), require(path.join(dialogsPath, dialog))])

    return Object.fromEntries(dialogs)
}