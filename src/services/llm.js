
const askAI = async ({ model, yorha, dialog, openAI, messages, response_format = { type: 'json_object' }, retryCount = 0 }) => {

    if (retryCount > 3) {
        yorha.commander.log(dialog.bunker.linkSevered, 'red')
        throw new Error()
    }

    try {
        const response = await openAI.chat.completions.create({
            model,
            messages,
            top_p: 0.1,
            response_format,
            temperature: 0.01,
        })
        let raw = response.choices[0].message.content.trim()
        raw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
        const match = raw.match(/[\{\[][\s\S]*[\}\]]/)
        const JSON5 = require('json5')
        return JSON5.parse(match ? match[0] : raw)
    } catch (err) {
        const statusCode = err.status || err.response?.status
        const isAuthError = err.message.includes('401') || err.message.includes('402') || [401, 402].includes(statusCode)
        if (isAuthError) {
            yorha.commander.log(dialog.bunker.accessDenied, 'red')
            throw new Error()
        }

        yorha.commander.log(dialog.bunker.networkInstability(retryCount + 1))

        return askAI({ model, yorha, dialog, openAI, messages, response_format, retryCount: retryCount + 1 })
    }
}

module.exports = ({ ux, config, yorha, openAI, dialogs, template, ...prompts }) => {

    const sharp = require('sharp')

    const { local } = ux
    const dialog = dialogs[local]
    const { textModel, visionModel } = config
    const { systemPrompt, apiPrompt, mockPrompt, linkerPrompt } = prompts
    const { UI_DESIGNER, API_DESIGNER, MOCK_DESIGNER } = systemPrompt

    return {
        generateMock: async ({ columns, fileName }) => {
            return askAI({
                yorha,
                openAI,
                dialog,
                model: textModel,
                messages: [
                    { role: 'system', content: MOCK_DESIGNER },
                    { role: 'user', content: mockPrompt({ columns, fileName }) }
                ]
            })
        },
        apiLinker: async ({ bunkerAnchors, realApis }) => {
            return askAI({
                yorha,
                openAI,
                dialog,
                model: textModel,
                messages: [
                    { role: 'system', content: API_DESIGNER },
                    { role: 'user', content: linkerPrompt({ bunkerAnchors, realApis }) }
                ]
            })
        },
        alignResponseFields: async ({ responseStr, resourceStr }) => {
            return askAI({
                yorha,
                openAI,
                dialog,
                model: textModel,
                messages: [
                    { role: 'system', content: API_DESIGNER },
                    { role: 'user', content: apiPrompt({ responseStr, resourceStr }) }
                ]
            })
        },
        recognizePage: async ({ prompt, filePath, taskType = 'page' }) => {
            const compressedBuffer = await sharp(filePath)
                .resize(1280, null, { withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer()
            const base64Image = compressedBuffer.toString('base64')

            return askAI({
                yorha,
                openAI,
                dialog,
                model: visionModel,
                messages: [
                    { role: 'system', content: UI_DESIGNER },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                        ]
                    }
                ],
                response_format: taskType === 'page' ? { type: 'json_schema', strict: true, json_schema: require(`../framework/${template}/schema/page.json`) } : { type: 'json_object' }
            })
        },
    }
}