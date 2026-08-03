const stringify = require('json-stringify-pretty-compact')

const wrapCode = code => `_CODE_${code}_CODE_`

const cleanCode = str => str
    .replace(/```[a-z]*\n?/gi, '')// 物理超度 Markdown 糖衣（解决```json 报错）
    .replace(/```/g, '')
    .replace(/\\"/g, '"') // 逻辑自愈 处理 AI 错误转义的引号（把 \" 还原回 "）
    .replace(/['"]?_CODE_([\s\S]*?)_CODE_['"]?/g, '$1') // 去掉 _CODE_ 包裹的代码
    .replace(/_CODE_/g, '')      // 兜底清理
    .replace(/"(\w+)":/g, '$1:') // 去掉 key 的双引号
    .replace(/"/g, "'")          // 双引号全部转单引号
    .replace(/[ \t]+$/gm, '')    // 去除每一行行尾的多余空格
    .replace(/\n{3,}/g, '\n\n')  // 将3个或以上的换行符压缩成2个换行符
    .replace(/^\s+/, '')         // 去掉文件头部的空行
    .trim() + '\n'

const contextStringify = ({ context, indent = 4, maxLength = 200 }) => stringify.default(context, { indent, maxLength })

module.exports = {
    wrapCode,
    cleanCode,
    contextStringify,
}
