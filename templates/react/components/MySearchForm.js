import dayjs from 'dayjs'
import { MyBaseForm } from './MyBaseForm'
import { useState, useEffect } from 'react'
import { Row, Col, Form, Button, Space } from 'antd'

export const MySearchForm = ({ form, search, loading, labelCol, setSearch, formItems, showLimit = 7, initialValues, customReset, extraOperate, customFinish, onValuesChange, syncUrlParams = true, defaultPageSize = 10 }) => {

    const [limit, setLimit] = useState(showLimit)

    const handleReset = () => {
        if (syncUrlParams) {
            window.history.replaceState(null, '', window.location.pathname)
        }
        if (customReset) {
            customReset()
        } else {
            setSearch({ pageNo: 1, pageSize: search.pageSize ?? defaultPageSize })
        }
    }

    const handleFinish = values => {
        const formattedValues = { ...values }
        if (syncUrlParams) {
            Object.keys(formattedValues).forEach(key => {
                const val = formattedValues[key]
                const isDateType = formItems.find(item => item.name === key)?.type?.includes('date')
                if (isDateType && val) {
                    if (Array.isArray(val) && val.length > 0) {
                        const [startKey, endKey] = key.split(',')
                        formattedValues[startKey] = val[0].startOf('day').valueOf()
                        formattedValues[endKey] = val[1].endOf('day').valueOf()
                        delete formattedValues[key]
                    } else {
                        formattedValues[key] = val.valueOf()
                    }
                }
            })
            const params = new URLSearchParams(Object.fromEntries(Object.entries(formattedValues).filter(([key, value]) => !['', null, undefined].includes(value))))
            window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
        }
        if (customFinish) {
            customFinish(formattedValues)
        } else {
            setSearch({ ...search, ...formattedValues, pageNo: 1 })
        }
    }

    useEffect(() => {
        if (Object.values(initialValues).length > 0 && formItems.length > 0) {
            const newValues = {}
            formItems.forEach(item => {
                if (initialValues[item.name] !== undefined) {
                    const value = initialValues[item.name]
                    newValues[item.name] = item.type?.includes('date') ? dayjs(Number(value)) : value
                }
                if (item.name.includes(',') && item.type?.includes('date')) {
                    const [startKey, endKey] = item.name.split(',')
                    if (initialValues[startKey] && initialValues[endKey]) {
                        newValues[item.name] = [dayjs(Number(initialValues[startKey])), dayjs(Number(initialValues[endKey]))]
                    }
                }
            })
            form.setFieldsValue(newValues)
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