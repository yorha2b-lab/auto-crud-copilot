const JSON5 = require('json5')
const sharp = require('sharp')
const OpenAI = require('openai')
const mockPrompt = require('../prompts/mock.js')
const { getConfig } = require('../utils/utils.js')
const apiPrompt = require('../prompts/watch-api.js')
const { UI_DESIGNER, API_DESIGNER, MOCK_DESIGNER } = require('../prompts/system.js')

const config = getConfig()

let client = null

const getOpenAI = () => {
    if (!client) {
        client = new OpenAI({ apiKey: process.env.API_KEY, baseURL: process.env.BASE_URL })
    }
    return client
}

const askAI = async (model, messages, retryCount = 0) => {

    if (retryCount > 3) throw new Error('AI 重试次数耗尽，请检查网络或图片')

    try {
        const openai = getOpenAI()
        const response = await openai.chat.completions.create({ model, messages, response_format: { type: 'json_object' } })
        let raw = response.choices[0].message.content.trim()
        raw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
        const match = raw.match(/[\{\[][\s\S]*[\}\]]/)
        return JSON5.parse(match ? match[0] : raw)
    } catch (err) {
        console.warn(`[解析失败，第 ${retryCount + 1} 次重试...]`, err.message)
        return askAI(model, messages, retryCount + 1)
    }
}

module.exports = {
    generateMock: async (columns, fileName) => {
        return askAI(
            config.textModel,
            [
                { role: 'system', content: MOCK_DESIGNER },
                { role: 'user', content: mockPrompt(columns, fileName) }
            ]
        )
    },
    recognizePage: async (prompt, filePath) => {
        const compressedBuffer = await sharp(filePath)
            .resize(1280, null, { withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer()
        const base64Image = compressedBuffer.toString('base64')
        return askAI(
            config.visionModel,
            [
                { role: 'system', content: UI_DESIGNER },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
                    ]
                }
            ]
        )
    },
    alignSwaggerFields: async (swaggerStr, resourceStr) => {
        return askAI(
            config.textModel,
            [
                { role: 'system', content: API_DESIGNER },
                { role: 'user', content: apiPrompt(swaggerStr, resourceStr) }
            ]
        )
    }
}