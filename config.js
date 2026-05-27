module.exports = {

    // 自定义模板目录
    // 如果为空，将使用内置模板
    // 自定义模板需要在hbsdir目录创建自己的index.hbs和resource.hbs文件
    hbsDir: '',

    useDemo: true,
    needMock: false,
    // 是否开启自动联调对齐协议 (42153 拦截塔)
    enableAutoAlignment: false,

    textModel: 'qwen-turbo',
    visionModel: 'qwen3.5-plus',

    hooksDir: 'src/hooks',
    pagesDir: 'src/pages',
    utilsDir: 'src/utils',
    componentsDir: 'src/components',

    responseSuccess: `response?.code === 200`,
    proxyTarget: 'http://id:port',// 代理目标，例如 http://localhost:3000

}