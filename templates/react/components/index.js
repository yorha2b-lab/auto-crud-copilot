import { initOSS } from '../utils/utils'
import { useState, useEffect } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Tree, Radio, Input, Upload, Select, Cascader, Checkbox, DatePicker, InputNumber, TreeSelect, AutoComplete } from 'antd'

const AliyunOSSUpload = ({ style, value, disabled, onChange }) => {

    const [OSSData, setOSSData] = useState()

    const init = async () => {
        try {
            const result = await initOSS()
            setOSSData(result)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        init()
    }, [])

    const handleChange = ({ fileList }) => onChange?.([...fileList])

    const onRemove = file => {
        const files = (value || []).filter(v => v.url !== file.url)
        onChange?.(files)
    }

    const getExtraData = file => ({
        key: file.url,
        policy: OSSData?.policy,
        Signature: OSSData?.signature,
        OSSAccessKeyId: OSSData?.accessId,
    })

    const beforeUpload = async file => {
        if (!OSSData) {
            return false
        }
        const expire = Number(OSSData.expire) * 1000
        if (expire < Date.now()) {
            await init()
        }
        file.url = `${OSSData.dir}/${file.name}`.replace(/\/\//g, '/')
        return file
    }

    const uploadProps = {
        onRemove,
        name: 'file',
        beforeUpload,
        fileList: value,
        data: getExtraData,
        action: OSSData?.host,
        onChange: handleChange,
    }

    return (
        <Upload {...uploadProps} disabled={disabled} style={style}>
            <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
    )
}

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
        case 'ossUpload':
            return <AliyunOSSUpload {...commonProps} />
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