module.exports = {

    // 自定义模板目录
    // 如果为空，将使用内置模板
    // 自定义模板需要在hbsdir目录创建自己的index.hbs和resource.hbs文件
    hbsDir: '',

    useDemo: true,
    needMock: false,

    textModel: 'qwen-turbo',
    visionModel: 'qwen3.5-plus',

    hooksDir: 'src/hooks',
    pagesDir: 'src/pages',
    utilsDir: 'src/utils',
    componentsDir: 'src/components',

    responseSuccess: `response?.code === 200`,

}