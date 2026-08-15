/**
 * YoRHa Bunker Construction System
 * This file is part of Bunker.
 * Bunker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * (c) 2026 [yorha2b-lab]. Glory to Mankind.
 */

module.exports = bunker => {

    const acp = bunker.get()
    const units = Object.values(acp.units)
    const dispatcher = acp.headquarters.dispatcher(acp, 2)
    const prompt = `
            # Mission Classification
            分析输入图片，判断它适合以下哪一种unit执行：
            可选units: ${units.map(unit => `
                Unit: ${unit.meta.name}
                Mission:${unit.meta.mission}
                Description: ${unit.meta.description}
                Capabilities: ${unit.meta.capabilities.join(', ')}
            `).join('\n')}

            ## Result
            return capabilities
            `.trim()

    dispatcher.onIdle(() => acp.yorha.commander.report(acp.dialog.bunker.systemStandby, 'gray'))

    return {
        receive: async mission => {
            const spinner = acp.yorha.commander.start(acp.dialog.bunker.detectedEnemy)
            try {
                const result = await acp.llm.recognizePage({ filePath: mission.input, prompt })
                acp.yorha.commander.success(spinner, acp.dialog.bunker.confirmEnemy)
                const unit = units.map(unit => ({ unit, score: unit.meta.capabilities.filter(cap => result.capabilities.includes(cap)).length }))
                    .filter(item => item.score > 0)
                    .sort((a, b) => b.score - a.score)[0]?.unit
                if (!unit) {
                    acp.yorha.commander.fail(spinner, acp.dialog.bunker.missionFailed)
                    return
                }
                dispatcher.add(() => unit.execute({ acp, mission }))
            } catch (error) {
                acp.yorha.commander.fail(spinner, acp.dialog.bunker.missionUnknown)
            }
        },
    }
}