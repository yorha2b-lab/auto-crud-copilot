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
    const dispatcher = acp.headquarters.dispatcher(acp, 2)

    dispatcher.onIdle(() => acp.yorha.commander.report(acp.dialog.bunker.systemStandby, 'gray'))

    return {
        receive: async mission => {
            const result = await acp.llm.recognizePage({ filePath: mission.input, prompt: acp.briefings.visionType })
            const unit = Object.values(acp.units).map(unit => ({ unit, score: unit.meta.capabilities.filter(cap => result.capabilities.includes(cap)).length }))
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)[0]?.unit
            if (!unit) {
                return
            }
            dispatcher.add(() => unit.execute({ acp, mission }))
        },
    }
}