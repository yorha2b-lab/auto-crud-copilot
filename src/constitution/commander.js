module.exports = units => `
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