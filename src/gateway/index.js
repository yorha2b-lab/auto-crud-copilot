module.exports = ({ yorha, dialog, prompts, logistics }) => {

    const sharp = require('sharp')

    const { sleep } = logistics.ux
    const { mock, system, council, response, similarity } = prompts
    const { UI_DESIGNER, API_DESIGNER, MOCK_DESIGNER } = system
    const { textModel, visionModel } = logistics.foundation.getConfig()

    const openAI = require('./client')()
    const askAI = require('./protocol')({ yorha, sleep, dialog, openAI })

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