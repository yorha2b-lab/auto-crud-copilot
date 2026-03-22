const fs = require('fs')
const path = require('path')
const JSON5 = require('json5')
const sharp = require('sharp')
const chalk = require('chalk')
const OpenAI = require('openai')
const { getConfig, language } = require('../utils/utils.js') // 导入语言助手

let client = null

/**
 * 获取 OpenAI 客户端实例（单例模式）
 */
const getOpenAI = () => {
    if (!client) {
        const localEnv = path.resolve(process.cwd(), '.env')
        const pkgEnv = path.resolve(__dirname, '../.env')
        require("dotenv").config({
            path: fs.existsSync(localEnv) ? localEnv : pkgEnv
        })
        client = new OpenAI({ apiKey: process.env.API_KEY, baseURL: process.env.BASE_URL })
    }
    return client
}

/**
 * 调用 AI 模型并解析响应
 */
const askAI = async (model, messages, retryCount = 0) => {
    // 最终重试失败：YoRHa 司令部连接中断
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
            response_format: { type: 'json_object' }
        })

        let raw = response.choices[0].message.content.trim()
        raw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')
        const match = raw.match(/[\{\[][\s\S]*[\}\]]/)
        return JSON5.parse(match ? match[0] : raw)

    } catch (err) {
        const isAuthError = err.message.includes('401') || err.message.includes('402');
        if (isAuthError) {
            // 权限错误：司令部拒绝访问
            throw new Error(language(
                '[系统警告] YoRHa 司令部拒绝访问：API Key 无效或额度耗尽，请检查！',
                '[SYSTEM ALERT] YoRHa Command Center Access Denied: Invalid API Key or quota exhausted!'
            ));
        }

        // 重试警告：神经云网络连接不稳
        console.warn(chalk.yellow(language(
            `[系统警告] 神经云网络连接不稳，正在尝试重新链接... (第 ${retryCount + 1} 次重试)`,
            `[SYSTEM ALERT] Neural Network instability detected. Attempting to re-establish link... (Retry #${retryCount + 1})`
        )), err.message)

        return askAI(model, messages, retryCount + 1)
    }
}

module.exports = {
    /**
     * 生成 Mock 数据
     */
    generateMock: async (columns, fileName) => {
        const config = getConfig()
        const mockPrompt = require('../prompts/mock.js')
        const { MOCK_DESIGNER } = require('../prompts/system.js')
        return askAI(
            config.textModel,
            [
                { role: 'system', content: MOCK_DESIGNER },
                { role: 'user', content: mockPrompt(columns, fileName) }
            ]
        )
    },

    /**
     * 识别页面截图
     */
    recognizePage: async (prompt, filePath) => {
        const config = getConfig()
        const { UI_DESIGNER } = require('../prompts/system.js')

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
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ]
        )
    },

    /**
     * 对齐 Response 接口字段
     */
    alignResponseFields: async (responseStr, resourceStr) => {
        const config = getConfig()
        const apiPrompt = require('../prompts/watch-api.js')
        const { API_DESIGNER } = require('../prompts/system.js')
        return askAI(
            config.textModel,
            [
                { role: 'system', content: API_DESIGNER },
                { role: 'user', content: apiPrompt(responseStr, resourceStr) }
            ]
        )
    }
}