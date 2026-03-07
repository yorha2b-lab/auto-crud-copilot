import { Form } from 'antd'
import { formNode } from './index'

export const MyBaseForm = ({ item, form }) => {

    const renderFormContent = item => {

        if (!item.name) {
            return typeof item.render === 'function' ? item.render(item) : (item.value ?? '-')
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