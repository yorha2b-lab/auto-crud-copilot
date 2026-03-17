import dayjs from 'dayjs'
import { history } from 'umi'
import { MyBaseForm } from './MyBaseForm'
import { useState, useEffect } from 'react'
import { Row, Col, Form, Button, Space } from 'antd'

export const MySearchForm = ({ form, search, loading, labelCol, setSearch, formItems, showLimit = 7, initialValues, customReset, extraOperate, customFinish, onValuesChange, defaultPageSize = 10 }) => {

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
        const formattedValues = { ...values }
        Object.keys(formattedValues).forEach(key => {
            const val = formattedValues[key]
            const isDateType = formItems.find(item => item.name === key)?.type?.includes('date')
            if (isDateType && val) {
                if (Array.isArray(val)) {
                    formattedValues[key] = val.map((d, i) => i === 0 ? d.startOf('day').valueOf() : d.endOf('day').valueOf()).join(',')
                } else {
                    formattedValues[key] = val.valueOf()
                }
            }
        })
        const params = new URLSearchParams(Object.fromEntries(Object.entries(formattedValues).filter(([key, value]) => !['', null, undefined].includes(value))))
        history.push({ search: params.toString() })
        if (customFinish) {
            customFinish(formattedValues)
        } else {
            setSearch({ ...search, ...formattedValues, pageNo: 1 })
        }
    }

    useEffect(() => {
        if (Object.values(initialValues).length > 0 && formItems.length > 0) {
            const entries = Object.entries(initialValues).filter(([key]) => formItems.some(item => item.name === key)).map(([key, value]) => [
                key,
                formItems.find(item => item.name === key)?.type?.includes('date') ? (value?.toString()?.includes(',') ? value?.split(',')?.map(item => dayjs(Number(item))) : dayjs(Number(value))) : value
            ])
            form.setFieldsValue(Object.fromEntries(entries))
        }
    }, [initialValues, form, formItems])

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