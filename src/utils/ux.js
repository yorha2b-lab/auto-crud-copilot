/**
 * (c) 2026 [yorha2b-lab]. Glory to Mankind.
 *
 */

const chalk = require('chalk')
const figlet = require('figlet')

const isCN = Intl.DateTimeFormat().resolvedOptions().locale.includes('zh')
const language = (zh, en) => (isCN ? zh : en)

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 引导序列
 * 模拟系统引导过程中的动画效果
 * @returns {void}
 */
const bootSequence = async version => {
    const lines = [
        chalk.cyan(figlet.textSync('AutoDev', { horizontalLayout: 'full' })),
        chalk.gray('Booting System...'),
        chalk.white(' [System] ') + chalk.green('Locale Detection: ') + chalk.cyan(language('ZH-CN', 'EN-US')),
        chalk.white(' [System] ') + chalk.green('YoRHa No.2 Type B Unit: ') + chalk.cyan('Online'),
        chalk.white(' [System] ') + chalk.green('Scanner Type 9S Unit: ') + chalk.cyan('Standby'),
        chalk.white(' [System] ') + chalk.green('Full-Channel Link: ') + chalk.cyan('Established'),
        chalk.white(' [Mission] ') + chalk.yellow('Bunker Construction Protocol: ') + chalk.cyan('v' + version),
        chalk.white(' [Bunker] ') + chalk.magenta('Glory to mankind. (人类荣光永存)'),
        chalk.gray('--------------------------------------------------\n')
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
const matrixEffect = async (duration = 1500) => {

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
            console.log(chalk.white(' [System] ') + chalk.green(language('所有构筑数据已同步至 Bunker 存储节点。', 'All data synced to Bunker storage nodes.')))
            if (currentTotal !== 0) {
                if (isLegendary) {
                    console.log(chalk.yellow.bold(language(` [Achievement] 物理克隆总数已超越 ${threshold} 战略阈值！当前战力：${currentTotal}`, ` [Achievement] Physical clone count has exceeded ${threshold} strategic threshold! Current power: ${currentTotal}`)))
                    console.log(chalk.yellow(language(' [Bunker] 恭喜指挥官，您的构筑协议已成为人类荣光的一部分。', ' [Bunker] Congratulations, your construction protocol is now part of humanity.')))
                } else {
                    console.log(chalk.cyan(language(` [System] 当前构筑总数：${currentTotal}。距离 ${threshold} 勋章还剩 ${threshold - currentTotal} 次。`, ` [System] Current clones: ${currentTotal}. ${threshold - currentTotal} to Achievement.`)))
                }
            }
            console.log(chalk.cyan(language(' [System] 如果它能帮您节省时间，请在 GitHub 上给它点个赞 ⭐。', ' [System] If it saves you time, feel free to give it a ⭐ on GitHub.')))
            console.log(chalk.cyan('\n[System] Signal Lost. Glory to Mankind.\n'))
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

module.exports = { language, matrixEffect, bootSequence }
