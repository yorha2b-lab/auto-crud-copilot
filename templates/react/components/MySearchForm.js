import dayjs from 'dayjs'
import { history } from 'umi'
import { MyBaseForm } from './MyBaseForm'
import { useState, useEffect } from 'react'
import { Row, Col, Form, Button, Space } from 'antd'

export const MySearchForm = ({ form, search, loading, labelCol, setSearch, formItems, showLimit = 7, dateSeparator = '\GMT\,', initialValues, customReset, extraOperate, customFinish, onValuesChange, defaultPageSize = 10 }) => {

    const [limit, setLimit] = useState(showLimit)

    const handleReset = () => {
        history.push({ search: '' })
        if (customReset) {
            customReset()
        } else {
            setSearch({ pageNo: 1, pageSize: search.pageSize ?? defaultPageSize })
        }
    }

    const handleFinish = values => {
        const params = new URLSearchParams(Object.fromEntries(Object.entries(values).filter(([key, value]) => !['', null, undefined].includes(value))))
        history.push({ search: params.toString() })
        if (customFinish) {
            customFinish(values)
        } else {
            setSearch({ ...search, ...values, pageNo: 1 })
        }
    }

    useEffect(() => {
        if (Object.values(initialValues).length > 0) {
            const entries = Object.entries(initialValues).filter(([key]) => formItems.some(item => item.name === key)).map(([key, value]) => [
                key,
                formItems.find(item => item.name === key)?.type?.includes('date') ? value?.split(dateSeparator)?.map(item => dayjs(item)) : value
            ])
            form.setFieldsValue(Object.fromEntries(entries))
        }
    }, [])

    return (
        <Form form={form} onFinish={handleFinish} labelCol={labelCol} onValuesChange={onValuesChange}>
            <Row gutter={24}>
                {formItems.slice(0, limit)?.map((item, ind) => (
                    <Col key={ind} span={item.span ?? 6}>
                        <MyBaseForm item={item} form={form} />
                    </Col>
                ))}
                <Col flex='auto' style={{ textAlign: 'right' }}>
                    <Form.Item>
                        <Space>
                            <Button type='primary' loading={loading} htmlType='submit'>查询</Button>
                            <Button onClick={handleReset} loading={loading} htmlType='reset'>重置</Button>
                            {extraOperate}
                            {formItems.length > showLimit && (<a onClick={() => setLimit(formItems.length > limit ? formItems.length : showLimit)}>{formItems.length > limit ? '展开' : '收起'}</a>)}
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    )
}