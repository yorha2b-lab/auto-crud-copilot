import { Form, Space } from 'antd'
import { formNode } from './index'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'

export const MyBaseForm = ({ item, form }) => {

    const renderFormContent = ({ item }) => {

        if (!item.name) {
            return item.value
        }

        const inputNode = (
            <Form.Item noStyle name={item.name} rules={item.rules} initialValue={item.value}>
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
                    fields.map((field, index) => (
                        <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                            {item.render(field, index, { add, remove }, form)}
                            {index !== 0 && <MinusCircleOutlined onClick={() => remove(field.name)} />}
                            {fields.length === index + 1 && <PlusCircleOutlined onClick={() => add()} />}
                        </Space>
                    ))
                )}
            </Form.List> :
            <Form.Item
                name={item.name}
                label={item.label}
                rules={item.rules}
                extra={item.extra}
                tooltip={item.tooltip}
                labelCol={item.labelCol}
                initialValue={item.value}
                wrapperCol={item.wrapperCol}
                valuePropName={item.valuePropName}
                required={item.required ?? !!item.rules}
                style={{ marginBottom: !item.name ? 0 : undefined, ...item.style }}
            >
                {item.render ? (typeof item.render === 'function' ? item.render(item, form) : item.render) : renderFormContent({ item })}
            </Form.Item>
    )
}