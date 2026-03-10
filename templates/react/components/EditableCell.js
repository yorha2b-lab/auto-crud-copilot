import { Form, Input, InputNumber, Select, Checkbox } from 'antd'
import React, { useRef, useState, useEffect, useContext } from 'react'

const EditableContext = React.createContext(null)

export const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm()
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
}

export const EditableCell = ({ title, record, editable, children, dataIndex, handleSave, rules = [], options = [], editType = 'text', ...restProps }) => {

    const inputRef = useRef(null)
    const form = useContext(EditableContext)

    const [editing, setEditing] = useState(false)

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus()
        }
    }, [editing])

    const toggleEdit = () => {
        setEditing(!editing)
        form.setFieldsValue({ [dataIndex]: record[dataIndex] })
    }

    const save = async () => {
        try {
            const values = await form.validateFields()
            toggleEdit()
            handleSave({ ...record, ...values })
        } catch (errInfo) {
            console.log('保存失败:', errInfo)
        }
    }

    let inputNode

    switch (editType) {
        case 'number':
            inputNode = <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
            break
        case 'select':
            inputNode = <Select ref={inputRef} options={options} onBlur={save} />
            break;
        case 'checkbox':
            inputNode = <Checkbox.Group options={options} onChange={save} />
            break;
        default:
            inputNode = <Input ref={inputRef} onPressEnter={save} onBlur={save} />
    }

    return (
        <td {...restProps}>
            {editable ? (
                editing ? (
                    <Form.Item rules={rules} name={dataIndex} style={{ margin: 0 }}>
                        {inputNode}
                    </Form.Item>
                ) : (
                    <div onClick={toggleEdit} className='editable-cell-value-wrap' style={{ paddingRight: 24, minHeight: 32, cursor: 'pointer' }}>
                        {children}
                    </div>
                )
            ) : (children)}
        </td>
    )
}