module.exports = () => {

    const ora = require('ora')
    const chalk = require('chalk')

    const createMember = ({ name }) => ({
        start(text) {
            const spinner = ora({ text: chalk.cyan(`\n${name} ${text}`) }).start()
            return spinner
        },
        fail(spinner, text) {
            spinner.fail(chalk.red(`\n${name} ${text}`))
        },
        log(text, color = 'gray') {
            console.log(chalk[color](`\n${name} ${text}`))
        },
        report(text, color = 'yellow') {
            console.log(chalk[color](`\n${name} ${text}`))
        },
        update(spinner, text) {
            spinner.text = chalk.cyan(`\n${name} ${text}`)
        },
        warning(spinner, text) {
            spinner.warn(chalk.yellow(`\n${name} ${text}`))
        },
        success(spinner, text) {
            spinner.succeed(chalk.green(`\n${name} ${text}`))
        },
    })

    return {
        nineS: createMember({ name: '[YoRHa::9S]' }),
        commander: createMember({ name: '[BUNKER]' }),
        pod042: createMember({ name: '[YoRHa::Pod042]' }),
        pod153: createMember({ name: '[YoRHa::Pod153]' }),
        operator6O: createMember({ name: '[YoRHa::6O]' }),
    }

}