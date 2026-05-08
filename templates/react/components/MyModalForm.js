import dayjs from 'dayjs'
import { MyBaseForm } from './MyBaseForm'
import { useState, useEffect } from 'react'
import { Row, Col, Form, Modal, } from 'antd'

export const MyModalForm = ({ width, title, submit, record, visible, setModal, labelCol, formItems, wrapperCol, onValuesChange }) => {

    const [form] = Form.useForm()
    const [pending, setPending] = useState(false)

    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (record && Object.keys(record).length > 0) {
                const itemMap = new Map(formItems.map(i => [i.name, i]))
                const initialData = {}
                Object.entries(record).forEach(([key, value]) => {
                    const config = itemMap.get(key)
                    if (config?.type?.includes('date') && value) {
                        if (Array.isArray(value)) {
                            initialData[key] = value.map(v => dayjs(v))
                        } else if (typeof value === 'string' && value.includes(',')) {
                            initialData[key] = value.split(',').map(v => dayjs(v))
                        } else {
                            initialData[key] = dayjs(value)
                        }
                    } else {
                        initialData[key] = value
                    }
                })
                form.setFieldsValue(initialData)
            }
        }
    }, [visible, record, form, formItems])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (submit) {
                setPending(true)
                await submit({ ...record, ...values })
                setPending(false)
            }
        } catch (error) {
            console.log('表单校验失败:', error)
        }
    }

    const handleCancel = () => {
        setModal({ visible: false })
        form.resetFields()
    }

    return (
        <Modal centered title={title} width={width} open={visible} onOk={handleOk} destroyOnClose onCancel={handleCancel} confirmLoading={pending}>
            <Form form={form} preserve={false} labelCol={labelCol} wrapperCol={wrapperCol} onValuesChange={(changed, all) => onValuesChange?.({ changed, all, form, record })}>
                <Row gutter={[24, 0]}>
                    {formItems.map((item, index) =>
                        <Col span={item.span ?? 24} key={item.name || index}>
                            <MyBaseForm item={item} form={form} />
                        </Col>
                    )}
                </Row>
            </Form>
        </Modal>
    )
}