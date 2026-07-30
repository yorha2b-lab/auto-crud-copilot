const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = ({ root, dialog }) => ({
    dirs: dir => fs.mkdirSync(path.join(root, dir), { recursive: true }),
    files: ({ from, to, exist, success }) => {
        const target = path.join(root, 'bunker', to)
        if (fs.existsSync(target)) {
            return console.log(chalk.yellow(dialog.bunker[exist]))
        }
        fs.cpSync(path.resolve(__dirname, `../../${from}`), target, { recursive: true })
        console.log(chalk.green(dialog.bunker[success]))
    }
})