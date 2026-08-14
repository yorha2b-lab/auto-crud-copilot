module.exports = `
# Mission Classification

分析输入图片，判断它属于以下哪一种任务类型：

## Full CRUD Page

完整的 CRUD 页面。

满足以下特征中的大部分：
- 页面结构完整
- 包含页面级功能区域
- 包含查询表单或筛选区域
- 包含表格主体
- 包含行操作
- 包含新增、编辑、删除等功能按钮
- 可能包含统计区域、导出按钮等页面级功能

返回：

{
    "capabilities": [
        "vision",
        "page-analysis",
        "page-generation"
    ]
}

## Partial CRUD Page

局部 CRUD 页面或 UI 碎片。

例如：
- 仅包含表格
- 仅包含表单
- 仅包含筛选区域
- 仅包含某个 CRUD 功能区域
- 页面结构明显不完整

返回：

{
    "capabilities": [
        "vision",
        "component-analysis",
        "component-generation"
    ]
}

## Result

只允许返回 JSON：

{
    "capabilities": []
}

不要返回任何额外文字。
`.trim()