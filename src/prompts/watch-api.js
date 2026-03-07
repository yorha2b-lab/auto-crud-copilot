module.exports = (swaggerStr, resourceStr) => `
swaggerStr: ${swaggerStr}
resourceStr: ${resourceStr}
resourceStr是前端目前猜测的字段名列表(请从resourceStr中提取dataIndex和name)，
swaggerStr是后端的真实响应。
请比对两者，找出现有前端字段名应该被替换为哪个真实的后端字段名。
匹配规则: 1.完全相同 2.下划线/驼峰转换 3.语义相似。
请只输出一个JSON对象, Key为前端猜测的旧名字, Value为Swagger里的真实新名字。
例如：{"key_1": "key1"}
如果没有找到对应的，请不要包含在结果中。
`.trim()