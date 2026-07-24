/**
 * (c) 2026 [yorha2b-lab]. Glory to Mankind.
 *
 */

const chalk = require('chalk')
const figlet = require('figlet')

const local = Intl.DateTimeFormat().resolvedOptions().locale.toUpperCase()

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 引导序列
 * 模拟系统引导过程中的动画效果
 * @returns {void}
 */
const bootSequence = async (version) => {
    const lines = [
        chalk.cyan(figlet.textSync('AutoDev', { horizontalLayout: 'full' })),
        chalk.gray('[BUNKER] Booting System...'),
        chalk.white('[BUNKER] ') + chalk.green('Locale Detection: ') + chalk.cyan(local),
        chalk.white('[BUNKER] ') + chalk.green('YoRHa No.2 Type B Unit: ') + chalk.cyan('Online'),
        chalk.white('[BUNKER] ') + chalk.green('Scanner Type 9S Unit: ') + chalk.cyan('Standby'),
        chalk.white('[BUNKER] ') + chalk.green('Full-Channel Link: ') + chalk.cyan('Established'),
        chalk.white('[BUNKER] ') + chalk.yellow('Construction Protocol: ') + chalk.cyan('v' + version),
        chalk.white('[BUNKER] ') + chalk.magenta('Glory to mankind. (人类荣光永存)'),
        chalk.gray('--------------------------------------------------')
    ]
    for (const line of lines) {
        console.log(line)
        await sleep(line.includes('AutoDev') ? 300 : 80)
    }
}

/**
 * 矩阵效果
 * 模拟数据物理封存过程中的矩阵效果
 * @param {number} duration - 持续时间（毫秒）
 * @returns {void}
 */
const matrixEffect = async (duration = 1500, dialog) => {

    let currentTotal = 0
    const MIRROR_URL = 'https://cdn.jsdelivr.net/gh/yorha2b-lab/auto-crud-copilot@github-repo-stats/bunker-stats.json'

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 800)
        const response = await fetch(MIRROR_URL, { signal: controller.signal })
        const stats = await response.json()
        currentTotal = stats.total_clones || 0
        clearTimeout(timeoutId)
    } catch (e) {
        currentTotal = 0
    }

    const coreFragments = [
        '47 4c 4f 52 59', // GLORY
        '54 4f 20 4d 41', // TO MA
        '4e 4b 49 4e 44', // NKIND
        '59 6f 52 48 61', // YoRHa
        '32 42 2d 55 6e', // 2B-Un
        '69 74 20 4f 4b', // it OK
        '39 53 2d 48 61', // 9S-Ha
        '63 6b 69 6e 67', // cking
        '5f 43 4f 44 45 5f' // _CODE_
    ]

    const threshold = 5000
    const endTime = Date.now() + duration
    const width = process.stdout.columns || 80
    const isLegendary = currentTotal >= threshold

    if (isLegendary) {
        const achievement = `${threshold}+`
        const hex = achievement.split('').map(char => char.charCodeAt(0).toString(16)).join(' ')
        coreFragments.push(chalk.yellow.bold(hex))
        coreFragments.push(chalk.yellow.bold('4c 45 47 45 4e 44')) // "LEGEND"
    }

    const interval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(interval)
            console.log(dialog.bunker.dataSynced)
            if (currentTotal !== 0) {
                if (isLegendary) {
                    console.log(chalk.yellow.bold(dialog.bunker.strategicThreshold(threshold, currentTotal)))
                }
                console.log(chalk.yellow(dialog.bunker.isLegendary(isLegendary, currentTotal, threshold)))
            }
            console.log(chalk.cyan(dialog.bunker.star))
            console.log(chalk.gray(dialog.bunker.exit))
            process.exit(0)
            return
        }
        let line = ''
        while (line.length < width) {
            if (Math.random() > 0.8) {
                const frag = coreFragments[Math.floor(Math.random() * coreFragments.length)]
                line += chalk.white.bold(frag) + ' '
            } else {
                const hex = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
                const color = (isLegendary && Math.random() > 0.95) ? chalk.yellow : (Math.random() > 0.5 ? chalk.cyan : chalk.cyan.dim)
                line += color(hex) + ' '
            }
        }
        process.stdout.write(line.substring(0, width * 10) + '\n')
    }, 40)
}

module.exports = { local, matrixEffect, bootSequence }
