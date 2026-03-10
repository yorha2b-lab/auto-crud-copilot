module.exports = `
识别图片内容（搜索项，表格列，是否有勾选框，查询下拉选项，统计条等页面结构）
⚠️⚠️⚠️注意:
1.变量使用驼峰命名法
    【严禁中文】绝对不允许使用中文作为变量名或函数名
    【严禁js关键字】绝对不允许使用js关键字作为变量名或函数名(export/delete/const...)
2.标签页:
    tabs: [{tab:'tab1',key:'tab1'}]
    表格上方的Button请务必归类为functionButton,只有当一组水平排列的项下方有明显的长横线(Ink Bar),或者呈现明显的'卡片包裹感'(Card style)时才识别为tabs
3.搜索项：
    formItems: [{ label: '文本', name: '对应的英文名词' }],
    ⚠️⚠️⚠️注意：
    如果是下拉框,请加入type:'select',options:_CODE_对应的英文名词Options_CODE_
    如果是时间范围查询,请加入type:'daterange',name:'对应的英文名词start,对应的英文名词end'
4.表格:
    {
        pagination: true/false,
        expandable: true/false,
        rowSelection: true/false,
        staticInfo:{has:true/false,text:''},
        operation: [{label:'操作',action:'操作动词+ByRecord'}],
        columns: [{ title: '普通列', dataIndex:'对应的英文名词' }],
    }
    ⚠️⚠️⚠️注意：
    请不要在columns里加上操作列
    如果列需要排序请加上sorter:true
    如果是时间列,请加入render:_CODE_text=>timeRender({time:text})_CODE_
    如果是序号列直接渲染为{ title: '序号',render: _CODE_(_, record, index) => index + 1_CODE_ }
    如果是下拉框列(所对应的查询项明确是下拉框),请加入render:_CODE_text=>对应的options.find(item=>item.value===text)?.label_CODE_
    如果列需要过滤请加上filters:[],onFilter: _CODE_(value, record) => record[对应的英文名词].includes(value)_CODE_
5.功能按钮
    functionButtion:[{btn:'btn',action:'操作动词+模块英文名词'}]
    如果和表格行操作重复请在action加上BySelected前缀
    如果是导出功能,对应的动词为export+对应的英文名词,没有名词则为exportData
6.下拉选项字典
    optionDict:{_CODE_对应的英文名词Options_CODE:[]]}
    数组值为对应列展示的内容组成的类似{label:'',value:''}的数组
最后输出一个JSON对象,不要包含任何Markdown标签,格式如下
    { tabs: [], table: {}, formItems: [], optionDict: {}, functionButton: []}
`