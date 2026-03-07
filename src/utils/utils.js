const fs = require('fs')
const path = require('path')
const config = require('../../config.js')


/**
 * 大模型输出的标准 JSON 无法携带 render: (text) => <Tag> 等箭头函数。
 * 我们在 Prompt 中要求大模型用 _CODE_ 占位符包裹函数字符串，
 * 在此处用正则剥离外层的双引号和占位符，将其还原为真正的可执行 JS 代码。
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

const copyHooks = options => {
    const targetDir = path.join(process.cwd(), config.hooksDir)
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
    const hookDir = path.join(__dirname, `../../templates/${options.template}/hooks`)
    fs.readdirSync(hookDir).forEach(file => fs.copyFileSync(path.join(hookDir, file), path.join(targetDir, file)))
}

const copyComponents = options => {
    const targetDir = path.join(process.cwd(), config.componentsDir)
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
    const componentsDir = path.join(__dirname, `../../templates/${options.template}/components`)
    fs.readdirSync(componentsDir).forEach(file => fs.copyFileSync(path.join(componentsDir, file), path.join(targetDir, file)))
}

const getExistingMenus = (dir = config.pagesDir) => {
    const pagesDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(pagesDir)) return []
    return fs.readdirSync(pagesDir)
        .filter(file => fs.statSync(path.join(pagesDir, file)).isDirectory())
        .map(file => ({ label: file, key: file }))
}

const generateSmartImports = (codeStr, hasTabs) => {
    const hooksLib = ['useTableQuery']
    const reactLib = ['useState', 'useEffect', 'useRef', 'useMemo']
    const componentsLib = ['MyTable', 'MyModalForm', 'MySearchForm']
    const antdLib = ['Card', 'Space', 'Modal', 'Button', 'Alert', 'Table', 'Input', 'Select']

    const usedAntd = antdLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedHooks = hooksLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedReact = reactLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedComps = componentsLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))

    const imports = [
        usedReact.length && `import { ${usedReact.join(', ')} } from 'react'`,
        `import { Link, history } from 'umi'`,
        `import { request } from '../../utils/request'`,
        `import { ${hasTabs ? 'tabs, ' : ''}columns, formItems, modalItems } from './resource'`,
        ...usedHooks.map(hook => `import { ${hook} } from '../../hooks/${hook}'`),
        ...usedComps.map(comp => `import { ${comp} } from '../../components/${comp}'`),
        usedAntd.length && `import { Form,${usedAntd.join(', ')} } from 'antd'`
    ].sort((a, b) => a.length - b.length)

    return imports.filter(Boolean).join('\n')
}

module.exports = { copyHooks, cleanCode, copyComponents, getExistingMenus, generateSmartImports }