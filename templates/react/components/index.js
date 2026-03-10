import { Tree, Radio, Input, Upload, Select, Cascader, Checkbox, DatePicker, InputNumber, TreeSelect, AutoComplete } from 'antd'

export const formNode = ({ item }) => {

    const commonProps = {
        disabled: item.readOnly,
        style: { width: item.width ?? '100%' },
        placeholder: item.placeholder ?? `请${['select', 'cascader', 'date', 'daterange'].includes(item.type) ? '选择' : '输入'}`,
        ...item.props
    }

    switch (item.type) {
        case 'date':
            return <DatePicker {...commonProps} />
        case 'number':
            return <InputNumber  {...commonProps} />
        case 'daterange':
            return <DatePicker.RangePicker {...commonProps} />
        case 'radio':
            return <Radio.Group options={item.options} {...commonProps} />
        case 'treeSelect':
            return <TreeSelect treeData={item.options} {...commonProps} />
        case 'auto':
            return <AutoComplete options={item.options} {...commonProps} />
        case 'checkbox':
            return <Checkbox.Group options={item.options} {...commonProps} />
        case 'tree':
            return <Tree checkable treeData={item.options} {...commonProps} />
        case 'textarea':
            return <Input.TextArea autoSize={{ minRows: 4 }} {...commonProps} />
        case 'cascader':
            return <Cascader options={item.options} allowClear {...commonProps} />
        case 'select':
            return <Select allowClear mode={item.mode} options={item.options} {...commonProps} />
        case 'upload':
            return <Upload {...item.uploadProps} {...commonProps}>{item.content ?? '上传文件'}</Upload>
        default:
            return <Input allowClear {...commonProps} />
    }
}