module.exports = `
识别图片页面结构输出一个JSON对象,不要包含任何Markdown标签
1.表格
    { columns:[{ title: '普通列', dataIndex:'对应的英文名词' }]}
    ⚠️⚠️⚠️注意：
    请不要在columns里加上操作列
    如果列需要排序请加上sorter:true
    如果是时间列,请加入render:_CODE_text=>timeRender({time:text})_CODE_
    如果是序号列直接渲染为{ title: '序号',render: _CODE_(_, record, index) => index + 1_CODE_ }
    如果是下拉框列(所对应的查询项明确是下拉框),请加入render:_CODE_text=>对应的options.find(item=>item.value===text)?.label_CODE_
    如果列需要过滤请加上filters:[],onFilter: _CODE_(value, record) => record[对应的英文名词].includes(value)_CODE_
2.查询表单
    formItems: [{ label: '文本', name: '对应的英文名词' }],
    ⚠️⚠️⚠️注意：
    如果是下拉框,请加入type:'select',options:_CODE_对应的英文名词Options_CODE_
    如果是时间范围查询,请加入type:'daterange',name:'对应的英文名词start,对应的英文名词end'
3.下拉选项字典
    optionDict:{_CODE_对应的英文名词Options_CODE:[]]}
    数组值为对应列展示的内容组成的类似{label:'',value:''}的数组
4.弹窗表单
    modalItems:[{label:'基础项',name:'对应的英文名词',type:'text',rules:[{required:true,message:'字段不能为空'}]}]
    ⚠️⚠️⚠️注意:
    type:text/date/daterange/radio/checkbox/select/auto/textarea,如果是text可以省略
    如果type是auto/radio/select/checkbox,请加入options:_CODE_对应的英文名词Options_CODE_
    ** 只输出modalItems就可以，不需要对应的formItems和columns **
`