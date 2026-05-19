import { initOSS } from '../utils/utils'
import { useState, useEffect } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Tree, Radio, Input, Upload, Select, Cascader, Checkbox, DatePicker, InputNumber, TreeSelect, AutoComplete } from 'antd'

const AliyunOSSUpload = ({ value, onChange, ...restProps }) => {

    const { oss, url, path, options, ...originUploadProps } = restProps

    const [OSSData, setOSSData] = useState(oss)

    const init = async () => {
        try {
            const result = await initOSS(url, options)
            setOSSData(result)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (!OSSData) {
            init()
        }
    }, [])

    const handleChange = ({ fileList }) => onChange?.([...fileList])

    const onRemove = file => {
        const files = (value || []).filter(v => v.uid !== file.uid)
        onChange?.(files)
    }

    const getExtraData = file => ({
        key: file.url,
        policy: OSSData?.policy,
        Signature: OSSData?.signature,
        OSSAccessKeyId: OSSData?.accessKeyId,
        'x-oss-security-token': OSSData?.stsToken,
    })

    const beforeUpload = async file => {
        const expire = Number(OSSData.expire) * 1000
        if (expire < Date.now()) {
            await init()
        }
        file.url = `${OSSData?.dir ?? path}/${file.uid}_${file.name}`.replace(/\/\//g, '/')
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
        ...originUploadProps
    }

    return (
        <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
    )
}

export const formNode = ({ item }) => {

    const commonProps = {
        disabled: item.readOnly,
        style: { width: item.width ?? '100%' },
        placeholder: item.placeholder ?? `请${['select', 'cascader', 'date'].includes(item.type) ? '选择' : '输入'}`,
        ...item.props
    }

    switch (item.type) {
        case 'date':
            return <DatePicker {...commonProps} />
        case 'number':
            return <InputNumber  {...commonProps} />
        case 'ossUpload':
            return <AliyunOSSUpload {...commonProps} />
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
        case 'daterange':
            return <DatePicker.RangePicker {...commonProps} placeholder={undefined} />
        case 'cascader':
            return <Cascader showSearch allowClear options={item.options} {...commonProps} />
        case 'upload':
            return <Upload {...item.uploadProps} {...commonProps}>{item.content ?? '上传文件'}</Upload>
        case 'select':
            return <Select allowClear showSearch mode={item.mode} options={item.options} {...commonProps} />
        default:
            return <Input allowClear {...commonProps} />
    }
}