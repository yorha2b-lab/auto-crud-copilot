module.exports = () => {

    const ora = require('ora')
    const chalk = require('chalk')

    const createMember = ({ name }) => ({
        start(text) {
            const spinner = ora({ text: chalk.cyan(`${name} ${text}\n`) }).start()
            return spinner
        },
        fail(spinner, text) {
            spinner.fail(chalk.red(`${name} ${text}\n`))
        },
        report(text, color = 'yellow') {
            console.log(chalk[color](`${name} ${text}\n`))
        },
        update(spinner, text) {
            spinner.text = chalk.cyan(`${name} ${text}\n`)
        },
        warning(spinner, text) {
            spinner.warn(chalk.yellow(`${name} ${text}\n`))
        },
        success(spinner, text) {
            spinner.succeed(chalk.green(`${name} ${text}\n`))
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