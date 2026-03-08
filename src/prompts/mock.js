module.exports = (columns, fileName) => `
根据这些字段生成一个简单的get接口mock数据: ${JSON.stringify(columns)},
格式如下：
'POST /api/${fileName}': {data:模块对象列表},
`
