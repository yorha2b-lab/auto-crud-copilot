import dayjs from 'dayjs'
import { MyBaseForm } from './MyBaseForm'
import { useState, useEffect } from 'react'
import { Row, Col, Form, Modal, } from 'antd'

export const MyModalForm = ({ width, title, submit, record, visible, setModal, labelCol, formItems, wrapperCol, dateSeparator = '\GMT\,', onValuesChange }) => {

    const [form] = Form.useForm()
    const [pending, setPending] = useState(false)

    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (record && Object.keys(record).length > 0) {
                const entries = Object.entries(record).map(([key, value]) => [
                    key,
                    formItems.find(item => item.name === key)?.type?.includes('date') ? value?.split(dateSeparator)?.map(item => dayjs(item)) : value
                ])
                form.setFieldsValue(Object.fromEntries(entries))
            }
        }
    }, [visible, record, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (submit) {
                setPending(true)
                await submit({ ...record, ...values })
                setPending(false)
            }
        } catch (error) {
            setPending(false)
            console.log('表单校验失败:', error)
        }
    }

    const handleCancel = () => {
        setModal({ visible: false })
        form.resetFields()
    }

    return (
        <Modal centered title={title} width={width} open={visible} onOk={handleOk} destroyOnHidden onCancel={handleCancel} confirmLoading={pending}>
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