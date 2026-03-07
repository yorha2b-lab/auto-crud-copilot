import { useState } from 'react'
import { MyBaseForm } from './MyBaseForm'
import { Row, Col, Form, Button, Space } from 'antd'

export const MySearchForm = ({ form, search, labelCol, setSearch, formItems, showLimit = 7, customReset, extraOperate, customFinish, onValuesChange, defaultPageSize = 10 }) => {

    const [limit, setLimit] = useState(showLimit)

    const handleReset = () => {
        if (customReset) {
            customReset()
        } else {
            setSearch({ pageNo: 1, pageSize: search.pageSize ?? defaultPageSize })
        }
    }

    const handleFinish = values => {
        if (customFinish) {
            customFinish(values)
        } else {
            setSearch({ ...search, ...values, pageNo: 1 })
        }
    }

    return (
        <Form onFinish={handleFinish} labelCol={labelCol} onValuesChange={onValuesChange}>
            <Row gutter={24}>
                {formItems.slice(0, limit)?.map((item, ind) => (
                    <Col key={ind} span={item.span ?? 6}>
                        <MyBaseForm item={item} form={form} />
                    </Col>
                ))}
                <Col flex='auto' style={{ textAlign: 'right' }}>
                    <Form.Item>
                        <Space>
                            <Button type='primary' htmlType='submit'>查询</Button>
                            <Button onClick={handleReset} htmlType='reset'>重置</Button>
                            {extraOperate}
                            {formItems.length > showLimit && (<a onClick={() => setLimit(formItems.length > limit ? formItems.length : 7)}>{formItems.length > limit ? '展开' : '收起'}</a>)}
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    )
}