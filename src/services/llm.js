const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { language, getConfig } = require('../utils/utils.js')

let client = null

const getOpenAI = () => {
    if (!client) {
        const OpenAI = require('openai')
        const localEnv = path.resolve(process.cwd(), '.env')
        const pkgEnv = path.resolve(__dirname, '../.env')
        require("dotenv").config({
            path: fs.existsSync(localEnv) ? localEnv : pkgEnv
        })
        client = new OpenAI({ apiKey: process.env.API_KEY, baseURL: process.env.BASE_URL })
    }
    return client
}

const askAI = async ({ model, messages, response_format = { type: 'json_object' }, retryCount = 0 }) => {

    if (retryCount > 3) {
        throw new Error(language(
            'YoRHa 司令部连接中断：请检查网络状态或黑盒共鸣情况。',
            'YoRHa Command Link Severed: Check network status or Black Box resonance.'
        ))
    }

    try {
        const openai = getOpenAI()
        const response = await openai.chat.completions.create({
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
            throw new Error(language(
                '[系统警告] YoRHa 司令部拒绝访问：API Key 无效或额度耗尽，请检查！',
                '[SYSTEM ALERT] YoRHa Command Center Access Denied: Invalid API Key or quota exhausted!'
            ))
        }

        console.warn(chalk.yellow(language(
            `[系统警告] 神经云网络连接不稳，正在尝试重新链接... (第 ${retryCount + 1} 次重试)`,
            `[SYSTEM ALERT] Neural Network instability detected. Attempting to re-establish link... (Retry #${retryCount + 1})`
        )), err.message)

        return askAI({ model, messages, response_format, retryCount: retryCount + 1 })
    }
}

module.exports = {
    generateMock: async (columns, fileName) => {
        const config = getConfig()
        const mockPrompt = require('../prompts/mock.js')
        const { MOCK_DESIGNER } = require('../prompts/system.js')
        return askAI({
            model: config.textModel,
            messages: [
                { role: 'system', content: MOCK_DESIGNER },
                { role: 'user', content: mockPrompt(columns, fileName) }
            ]
        })
    },
    recognizePage: async (prompt, filePath, taskType = 'page') => {
        const config = getConfig()
        const { UI_DESIGNER } = require('../prompts/system.js')
        const sharp = require('sharp')
        const compressedBuffer = await sharp(filePath)
            .resize(1280, null, { withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer()
        const base64Image = compressedBuffer.toString('base64')

        return askAI({
            model: config.visionModel,
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
            response_format: taskType === 'page' ? { type: 'json_schema', strict: true, json_schema: require('../schema/page.json') } : { type: 'json_object' }
        })
    },
    alignResponseFields: async (options, responseStr, resourceStr) => {
        const config = getConfig()
        const { API_DESIGNER } = require('../prompts/system.js')
        const apiPrompt = require(`../prompts/${options.template}/watch-api.js`)
        return askAI({
            model: config.textModel,
            messages: [
                { role: 'system', content: API_DESIGNER },
                { role: 'user', content: apiPrompt(responseStr, resourceStr) }
            ]
        })
    }
}