const fs = require('fs')
const path = require('path')
const JSON5 = require('json5')
const sharp = require('sharp') // 图片压缩库，用于处理截图
const OpenAI = require('openai')
const { getConfig } = require('../utils/utils.js')

let client = null

/**
 * 获取 OpenAI 客户端实例（单例模式）
 * 优先使用项目根目录的 .env 文件，其次使用包内的 .env
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
 * @param {string} model - 模型名称（如 qwen3.5-plus, qwen-turbo）
 * @param {Array} messages - 对话消息数组
 * @param {number} retryCount - 重试次数
 * @returns {Object} 解析后的 JSON 对象
 */
const askAI = async (model, messages, retryCount = 0) => {
    // 最多重试 3 次，避免无限循环
    if (retryCount > 3) throw new Error('AI 重试次数耗尽，请检查网络或图片')

    try {
        const openai = getOpenAI()
        // 调用 AI 模型，强制返回 JSON 格式
        const response = await openai.chat.completions.create({
            model,
            messages,
            response_format: { type: 'json_object' }
        })

        let raw = response.choices[0].message.content.trim()

        // 清理可能的 Markdown 标记（```json ... ```）
        raw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')

        // 提取 JSON 内容（支持对象和数组）
        const match = raw.match(/[\{\[][\s\S]*[\}\]]/)

        // 使用 JSON5 解析（支持单引号、注释等非标准 JSON）
        return JSON5.parse(match ? match[0] : raw)
    } catch (err) {
        console.warn(`[解析失败，第 ${retryCount + 1} 次重试...]`, err.message)
        return askAI(model, messages, retryCount + 1)
    }
}

module.exports = {
    /**
     * 生成 Mock 数据
     * @param {Array} columns - 表格列配置
     * @param {string} fileName - 文件名
     * @returns {string} 生成的 Mock 数据字符串
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
     * 识别页面截图并提取结构信息
     * @param {string} prompt - 提示词
     * @param {string} filePath - 截图文件路径
     * @returns {Object} 识别后的页面配置对象
     */
    recognizePage: async (prompt, filePath) => {
        const config = getConfig()
        const { UI_DESIGNER } = require('../prompts/system.js')

        // 压缩图片到 1280px 宽度（避免超出 token 限制），质量 80%
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

    /**
     * 对齐 Swagger 接口字段与前端字段
     * @param {string} swaggerStr - 真实接口响应数据
     * @param {string} resourceStr - 前端 resource.js 内容
     * @returns {Object} 字段映射对象 { oldName: newName }
     */
    alignSwaggerFields: async (swaggerStr, resourceStr) => {
        const config = getConfig()
        const apiPrompt = require('../prompts/watch-api.js')
        const { API_DESIGNER } = require('../prompts/system.js')
        return askAI(
            config.textModel,
            [
                { role: 'system', content: API_DESIGNER },
                { role: 'user', content: apiPrompt(swaggerStr, resourceStr) }
            ]
        )
    }
}