module.exports = ({ utils, yorha, openAI, dialog, prompts }) => {

    const sharp = require('sharp')

    const { mock, system, council, response, similarity } = prompts
    const { UI_DESIGNER, API_DESIGNER, MOCK_DESIGNER } = system
    const { textModel, visionModel } = utils.foundation.getConfig()

    const askAI = async ({ model, messages, response_format = { type: 'json_object' }, retryCount = 0 }) => {

        if (retryCount >= 3) {
            yorha.commander.report(dialog.bunker.linkSevered, 'red')
            throw new Error(dialog.bunker.linkSevered)
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
            const isAuthError = [401, 402].includes(statusCode)
            if (isAuthError) {
                yorha.commander.report(dialog.bunker.accessDenied, 'red')
                throw new Error(dialog.bunker.accessDenied)
            }

            yorha.commander.report(dialog.bunker.networkInstability(retryCount + 1))

            return askAI({ model, messages, response_format, retryCount: retryCount + 1 })
        }
    }

    return {
        generateMock: async ({ columns, fileName }) => {
            return askAI({
                model: textModel,
                messages: [
                    { role: 'system', content: MOCK_DESIGNER },
                    { role: 'user', content: mock({ columns, fileName }) }
                ]
            })
        },
        nameSimilarity: async ({ fileName, english }) => {
            return askAI({
                model: textModel,
                messages: [
                    { role: 'system', content: UI_DESIGNER },
                    { role: 'user', content: similarity({ fileName, english }) }
                ]
            })
        },
        apiParser: async ({ bunkerAnchors, realApis }) => {
            return askAI({
                model: textModel,
                messages: [
                    { role: 'system', content: API_DESIGNER },
                    { role: 'user', content: council({ bunkerAnchors, realApis }) }
                ]
            })
        },
        recognizePage: async ({ prompt, filePath, schema }) => {
            const compressedBuffer = await sharp(filePath)
                .resize(1280, null, { withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer()
            const base64Image = compressedBuffer.toString('base64')

            return askAI({
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
                response_format: schema ? { strict: true, type: 'json_schema', json_schema: schema } : { type: 'json_object' }
            })
        },
        alignResponseFields: async ({ responseStr, resourceStr }) => {
            return askAI({
                model: textModel,
                messages: [
                    { role: 'system', content: API_DESIGNER },
                    { role: 'user', content: response({ responseStr, resourceStr }) }
                ]
            })
        },
    }
}