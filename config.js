/**
 * Auto CRUD Copilot 配置文件
 *
 * 此文件包含了项目运行所需的所有配置项
 */

module.exports = {

    useDemo: true,

    // 是否需要生成 Mock 数据
    needMock: false,

    // 使用的 AI 模型类型
    visionModel: 'qwen3.5-plus',

    textModel: 'qwen-turbo',

    // 自定义模板目录
    // 如果为空，将使用内置模板
    // 自定义模板需要在hbsdir目录创建自己的index.hbs和resource.hbs文件
    hbsDir: '',

    // 目标项目的 hooks 目录路径
    hooksDir: 'src/hooks',

    // 目标项目的 pages 目录路径
    pagesDir: 'src/pages',

    // 目标项目的 utils 目录路径
    utilsDir: 'src/utils',

    // 目标项目的 components 目录路径
    componentsDir: 'src/components',

    // 响应成功条件
    responseSuccess: 'response?.code === 200',

}