import { Form, Space } from 'antd'
import { formNode } from './index'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'

export const MyBaseForm = ({ item, form }) => {

    const renderFormContent = ({ item }) => {

        if (!item.name) {
            return item.value
        }

        const inputNode = (
            <Form.Item noStyle name={item.name} rules={item.rules} initialValue={item.value} valuePropName={item.valuePropName}>
                {formNode({ item })}
            </Form.Item>
        )

        if (item.unit) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>{inputNode}</div>
                    <span style={{ color: '#888', whiteSpace: 'nowrap' }}>{item.unit}</span>
                </div>
            )
        }

        return inputNode
    }

    return (
        item.isList ?
            <Form.List name={item.name} initialValue={item.value}>
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {fields.map((field, index) => (
                            <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                                {item.render(field, index, { add, remove }, form)}
                                {index !== 0 && <MinusCircleOutlined onClick={() => remove(field.name)} />}
                                {fields.length === index + 1 && <PlusCircleOutlined onClick={() => add()} />}
                            </Space>
                        ))}
                        {fields.length === 0 && <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>添加{item.label || '项'}</Button>}
                    </div>
                )}
            </Form.List> :
            <Form.Item
                label={item.label}
                extra={item.extra}
                tooltip={item.tooltip}
                labelCol={item.labelCol}
                wrapperCol={item.wrapperCol}
                required={item.required ?? !!item.rules}
                style={{ marginBottom: !item.name ? 0 : undefined, ...item.style }}
            >
                {item.render ? (typeof item.render === 'function' ? item.render(item, form) : item.render) : renderFormContent({ item })}
            </Form.Item>
    )
}