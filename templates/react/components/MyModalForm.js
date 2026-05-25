import dayjs from 'dayjs'
import { MyBaseForm } from './MyBaseForm'
import { useState, useEffect } from 'react'
import { Row, Col, Form, Modal, } from 'antd'

/**
 * @component MyModalForm
 * @description [地堡核心构筑舱] 通用弹窗表单组件。
 * 集成了“语义回显自愈”、“自动时间戳转换”及“原子级提交锁定”三大核心协议。
 *
 * @param {Object} props - 构筑参数
 * @param {string|number} [props.width] - 舱体物理宽度
 * @param {string} [props.title] - 舱体视觉标题
 * @param {Function} props.submit - 数据发射协议：提交表单后的核心回调函数
 * @param {Object} [props.record] - 初始物资包：用于编辑模式的数据回显
 * @param {boolean} props.visible - 激活信号：控制弹窗的物理显示状态
 * @param {Function} props.setModal - 指令中心：用于更新弹窗状态（开启/关闭）
 * @param {Array} props.formItems - 零部件清单：定义表单内部的输入单元
 * @param {Object} [props.labelCol] - 标签布局校准
 * @param {Object} [props.wrapperCol] - 控件布局校准
 * @param {Function} [props.onValuesChange] - 联动传感：捕获表单内部的信号波动
 *
 * @example
 * <MyModalForm
 *   title="构筑新模块"
 *   visible={visible}
 *   formItems={[{ label: '截止日期', name: 'deadline', type: 'date' }]}
 *   submit={async (vals) => await save(vals)}
 * />
 */
export const MyModalForm = ({ width, title, submit, record, visible, setModal, labelCol, formItems, wrapperCol, onValuesChange }) => {

    const [form] = Form.useForm()
    const [pending, setPending] = useState(false)

    /**
     * @description [数据回显协议] 当构筑舱开启时，自动对初始物资进行“语义格式化”。
     * 将后端传输的字符串/数字时间戳重新转化为地堡可读的 `dayjs` 对象。
     */
    useEffect(() => {
        if (visible) {
            form.resetFields()
            if (record && Object.keys(record).length > 0) {
                const itemMap = new Map(formItems.map(i => [i.name, i]))
                const initialData = {}
                Object.entries(record).forEach(([key, value]) => {
                    const config = itemMap.get(key)
                    // 💡 语义识别：若零部件类型为日期且数值存在，执行物理转化
                    if (config?.type?.includes('date') && value) {
                        if (Array.isArray(value)) {
                            // 处理范围日期
                            initialData[key] = value.map(v => dayjs(v))
                        } else if (typeof value === 'string' && value.includes(',')) {
                            // 处理逗号分隔的字符串日期
                            initialData[key] = value.split(',').map(v => dayjs(v))
                        } else {
                            // 处理单日期
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

    /**
     * @async
     * @function handleOk
     * @description [物理加压提交] 执行表单校验，并自动启动“时间戳转换协议”。
     * 确保发射至后端的数据包符合标准 Unix 时间戳（毫秒）规范。
     */
    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            const formattedValues = { ...values }
            formItems.forEach(item => {
                const val = formattedValues[item.name]
                if (item.type?.includes('date') && val) {
                    if (Array.isArray(val)) {
                        // 物理压实：将范围日期转化为逗号分隔的时间戳字符串
                        formattedValues[item.name] = val.map(v => v.valueOf()).join(',')
                    } else {
                        // 物理转化：将 dayjs 对象还原为原始数值（毫秒）
                        formattedValues[item.name] = val.valueOf()
                    }
                }
            })
            if (submit) {
                setPending(true)
                await submit({ ...record, ...formattedValues })
                setPending(false)
            }
        } catch (error) {
            console.log('表单校验失败:', error)
        }
    }

    /**
     * @function handleCancel
     * @description 执行“撤退协议”：关闭构筑舱并清除当前逻辑残留。
     */
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