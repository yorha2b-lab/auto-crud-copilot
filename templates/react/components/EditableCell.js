import { Form, Input, InputNumber, Select, Checkbox } from 'antd'
import React, { useRef, useState, useEffect, useContext } from 'react'

const EditableContext = React.createContext(null)

export const EditableRow = ({ index, record, ...props }) => {

    const [form] = Form.useForm()

    useEffect(() => {
        if (record) {
            form.setFieldsValue(record)
        }
    }, [record])

    return (
        <Form form={form} component={false} onValuesChange={(changedValue, allValue) => props?.onValuesChange?.({ changedValue, allValue, form })}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
}

export const EditableCell = ({ title, record, editable, disabled, children, dataIndex, placeholder, handleSave, defaultEdit, rules = [], options = [], editType = 'text', ...restProps }) => {

    const inputRef = useRef(null)
    const form = useContext(EditableContext)

    const [editing, setEditing] = useState(false)

    useEffect(() => {
        if (editing) {
            if (inputRef.current && typeof inputRef.current.focus === 'function') {
                inputRef.current.focus()
            }
        }
    }, [editing])

    const toggleEdit = () => {
        setEditing(!editing)
        form.setFieldsValue({ [dataIndex]: record[dataIndex] })
    }

    const save = async () => {
        try {
            const values = await form.validateFields()
            if (!defaultEdit) {
                toggleEdit()
            }
            handleSave({ ...record, ...values })
        } catch (errInfo) {
            console.log('保存失败:', errInfo)
        }
    }

    let inputNode

    const formProps = {
        rules,
        name: dataIndex,
        style: { margin: 0 },
    }

    const commonProps = {
        onBlur: save,
        disabled: disabled,
        placeholder: placeholder ?? title,
    }

    switch (editType) {
        case 'select':
            inputNode = <Select ref={inputRef} options={options} {...commonProps} />
            break;
        case 'number':
            inputNode = <InputNumber ref={inputRef} onPressEnter={save} {...commonProps} />
            break
        case 'checkbox':
            inputNode = (
                <div tabIndex={-1} onBlur={e => {
                    // 确保失去焦点时，新的焦点不在当前 checkbox 组内部
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        save()
                    }
                }}>
                    <Form.Item {...formProps}>
                        <Checkbox.Group ref={inputRef} options={options} disabled={disabled} {...(options.length === 1 ? { onChange: save } : {})} />
                    </Form.Item>
                </div>
            )
            break;
        default:
            inputNode = <Input ref={inputRef} onPressEnter={save} {...commonProps} />
    }

    return (
        <td {...restProps}>
            {editable ? (
                editing || defaultEdit ? (
                    <Form.Item {...(['checkbox'].includes(editType) ? { style: formProps.style } : formProps)}>
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