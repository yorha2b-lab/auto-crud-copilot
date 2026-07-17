module.exports = ({ template }) => {

    const fs = require('fs')
    const path = require('path')

    const promptsPath = path.join(__dirname, `../framework/${template}/prompts`)
    const prompts = fs.readdirSync(promptsPath).map(prompt => [`${path.basename(prompt, '.js')}Prompt`, require(path.join(promptsPath, prompt))])

    return Object.fromEntries(prompts)
}