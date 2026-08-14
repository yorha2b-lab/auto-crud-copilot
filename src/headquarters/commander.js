module.exports = bunker => {

    const acp = bunker.get()
    const dispatcher = require('../headquarters/dispatcher')(acp, 2)

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