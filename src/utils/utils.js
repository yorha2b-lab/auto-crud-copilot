const fs = require('fs')
const path = require('path')

/**
 * 获取项目配置信息
 * 优先读取项目根目录的 config.js，如果不存在则使用默认配置
 * @returns {Object} 合并后的配置对象
 */
const getConfig = () => {
    const localConfigPath = path.join(process.cwd(), 'config.js') // 项目根目录配置
    const defaultConfigPath = path.resolve(__dirname, '../../config.js') // 默认配置
    let config = require(defaultConfigPath)
    if (fs.existsSync(localConfigPath)) {
        const userConfig = require(localConfigPath)
        config = { ...config, ...userConfig } // 合并用户自定义配置
    }
    return config
}

/**
 * 清理大模型生成的代码
 * 大模型输出的标准 JSON 无法携带 render: (text) => <Tag> 等箭头函数。
 * 我们在 Prompt 中要求大模型用 _CODE_ 占位符包裹函数字符串，
 * 在此处用正则剥离外层的双引号和占位符，将其还原为真正的可执行 JS 代码。
 *
 * @param {string} str - 大模型返回的 JSON 字符串
 * @returns {string} 清理后的可执行 JS 代码
 */
const cleanCode = str => {
    return str
        .replace(/"(\w+)":/g, '$1:') // 去掉 key 的双引号
        .replace(/"/g, "'")          // 双引号全部转单引号
        .replace(/['"]_CODE_([\s\S]*?)_CODE_['"]/g, '$1') // 去掉 _CODE_ 包裹的代码
        .replace(/_CODE_/g, '')      // 兜底清理
        .replace(/[ \t]+$/gm, '')    // 去除每一行行尾的多余空格
        .replace(/\n{3,}/g, '\n\n')  // 将3个或以上的换行符压缩成2个换行符
        .replace(/^\s+/, '')         // 去掉文件头部的空行
        .trim() + '\n'
}

/**
 * 获取已有的页面菜单配置
 * @param {string} dir - 页面目录路径（默认 'src/pages'）
 * @returns {Array} 菜单数组 [{ label: '页面名', key: '页面名' }]
 */
const getExistingMenus = (dir = 'src/pages') => {
    const pagesDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(pagesDir)) return []
    return fs.readdirSync(pagesDir)
        .filter(file => fs.statSync(path.join(pagesDir, file)).isDirectory())
        .map(file => ({ label: file, key: file }))
}

/**
 * 生成智能导入语句
 * 根据代码中实际使用的依赖，自动生成对应的 import 语句
 *
 * @param {string} codeStr - 生成的代码字符串
 * @param {boolean} hasTabs - 是否包含标签页
 * @returns {string} 拼接后的 import 语句
 */
const generateSmartImports = (codeStr, hasTabs) => {
    const hooksLib = ['useTableQuery'] // 自定义 hooks 库
    const reactLib = ['useState', 'useEffect', 'useRef', 'useMemo'] // React 核心库
    const componentsLib = ['MyTable', 'MyModalForm', 'MySearchForm'] // 自定义组件库
    const antdLib = ['Card', 'Space', 'Modal', 'Button', 'Alert', 'Table', 'Input', 'Select'] // Ant Design 组件库

    // 检测代码中实际使用的组件
    const usedAntd = antdLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedHooks = hooksLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedReact = reactLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedComps = componentsLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))

    // 构建 import 语句数组
    const imports = [
        usedReact.length && `import { ${usedReact.join(', ')} } from 'react'`,
        `import { Link, history } from 'umi'`,
        `import { request } from '../../utils/request'`,
        `import { ${hasTabs ? 'tabs, ' : ''}columns, formItems, modalItems } from './resource'`,
        ...usedHooks.map(hook => `import { ${hook} } from '../../hooks/${hook}'`),
        ...usedComps.map(comp => `import { ${comp} } from '../../components/${comp}'`),
        usedAntd.length && `import { Form, ${usedAntd.join(', ')} } from 'antd'`
    ].sort((a, b) => a.length - b.length) // 按长度排序（短的在前）

    return imports.filter(Boolean).join('\n') // 过滤空值并拼接
}

/**
 * 复制模板目录到目标项目
 * @param {Object} options - 命令行选项
 * @param {string} templateSubDir - 模板子目录（如 'hooks'、'components'）
 * @param {string} targetSubDir - 目标子目录（如 'src/hooks'、'src/components'）
 */
const copyTemplateDir = (options, templateSubDir, targetSubDir) => {
    const targetDir = path.join(process.cwd(), targetSubDir)
    const sourceDir = path.join(__dirname, `../../templates/${options.template}/${templateSubDir}`)
    if (!fs.existsSync(sourceDir)) return
    fs.mkdirSync(targetDir, { recursive: true })
    fs.readdirSync(sourceDir).forEach(file => {
        const src = path.join(sourceDir, file)
        const dest = path.join(targetDir, file)
        if (!fs.existsSync(dest)) {
            fs.cpSync(src, dest, { recursive: true })
        }
    })
}

// 导出工具函数
module.exports = { getConfig, cleanCode, getExistingMenus, copyTemplateDir, generateSmartImports }
