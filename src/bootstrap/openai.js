module.exports = () => {

    const fs = require('fs')
    const path = require('path')
    const OpenAI = require('openai')

    const pkgEnv = path.resolve(__dirname, '../.env')
    const localEnv = path.resolve(process.cwd(), '.env')
    require('dotenv').config({ path: fs.existsSync(localEnv) ? localEnv : pkgEnv })
    const openAI = new OpenAI({ apiKey: process.env.API_KEY, baseURL: process.env.BASE_URL })

    return openAI
}