/**
 * AI 服务模块
 *
 * 此模块负责与 AI 模型交互，提供以下核心功能：
 * 1. 识别 UI 页面结构
 * 2. 生成 Mock 数据
 * 3. 对齐前后端 API 字段
 */
const JSON5 = require('json5')
const sharp = require('sharp')
const OpenAI = require('openai')
const config = require('../../config.js')
const mockPrompt = require('../prompts/mock.js')
const apiPrompt = require('../prompts/watch-api.js')
const { UI_DESIGNER, API_DESIGNER, MOCK_DESIGNER } = require('../prompts/system.js')

// 初始化 OpenAI 客户端
const openai = new OpenAI({ apiKey: process.env.API_KEY, baseURL: process.env.BASE_URL })

/**
 * 向 AI 模型发送请求并获取响应
 * @param {string} model - AI 模型名称
 * @param {Array} messages - 消息数组
 * @param {number} retryCount - 当前重试次数
 * @returns {Object} AI 返回的解析后的 JSON 对象
 */
const askAI = async (model, messages, retryCount = 0) => {

    // 限制最大重试次数
    if (retryCount > 3) throw new Error('AI 重试次数耗尽，请检查网络或图片')

    try {
        // 调用 AI 模型 API
        const response = await openai.chat.completions.create({ model, messages, response_format: { type: 'json_object' } })

        // 清理响应内容，移除可能的代码块标记
        let raw = response.choices[0].message.content.trim()
        raw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '')

        // 尝试提取 JSON 对象并解析
        const match = raw.match(/[\{\[][\s\S]*[\}\]]/)
        return JSON5.parse(match ? match[0] : raw)
    } catch (err) {
        // 解析失败时记录警告并重试
        console.warn(`[解析失败，第 ${retryCount + 1} 次重试...]`, err.message)
        return askAI(model, messages, retryCount + 1)
    }
}

module.exports = {
    /**
     * 生成 Mock 数据
     * @param {Array} columns - 表格列配置
     * @param {string} fileName - 文件名
     * @returns {Object} 生成的 Mock 数据
     */
    generateMock: async (columns, fileName) => {
        return askAI(
            config.textModel,
            [
                { role: 'system', content: MOCK_DESIGNER },
                { role: 'user', content: mockPrompt(columns, fileName) }
            ]
        )
    },

    /**
     * 识别页面结构
     * @param {string} prompt - 提示词
     * @param {string} filePath - 图片文件路径
     * @returns {Object} 识别出的页面结构配置
     */
    recognizePage: async (prompt, filePath) => {
        // 压缩图片以提高处理效率
        const compressedBuffer = await sharp(filePath)
            .resize(1280, null, { withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer()
        const base64Image = compressedBuffer.toString('base64')

        // 调用 AI 模型识别页面结构
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
     * 对齐 Swagger 字段
     * @param {string} swaggerStr - Swagger API 文档字符串
     * @param {string} resourceStr - 前端资源配置字符串
     * @returns {Object} 字段映射关系
     */
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