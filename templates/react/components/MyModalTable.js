import { MyTable } from './MyTable'
import { useMemo, useState } from 'react'
import { Modal, Space, Button } from 'antd'
import { MySearchForm } from './MySearchForm'
import { useTableQuery } from '../hooks/useTableQuery'

/**
 * @component MyModalTable
 * @description [地堡支援型作战单元] 弹窗数据选择平台。
 * 专门用于执行“关联选择”、“子数据审计”或“二级逻辑骇入”任务。
 * 具备独立的数据获取链路、可选的搜索过滤系统以及与主构筑舱（setModalForm）的跨维协同能力。
 *
 * @param {Object} props - 支援参数
 * @param {Function} props.api - 弹窗内独立的数据源指令
 * @param {Function} [props.onOk] - 战果物理确认：按下确认按钮后的异步回调协议
 * @param {string} [props.title] - 舱体视觉标题
 * @param {string|number} [props.width] - 舱体物理宽度
 * @param {React.ReactNode} [props.footer] - 底座指令区：支持完全自定义操作按钮
 * @param {boolean} props.visible - 激活信号：控制支援单元的显示状态
 * @param {Function} props.operate - 动态火力配置：生成操作列的函数，接收 { refresh, setModalForm } 句柄
 * @param {Function} props.setModal - 单元注销中心：用于关闭当前弹窗
 * @param {Array} [props.formItems] - 局部搜索零部件：用于在弹窗内执行精准情报过滤
 * @param {Function} [props.setModalForm] - [重要] 跨维调用：由主页面注入的表单控制句柄，实现“弹窗开弹窗”的非耦合交互
 * @param {Object} [props.rowSelection] - 战术勾选：用于多选物资
 * @param {Function} props.formatResponse - 数据清洗协议：对 API 吐出的原始物资进行格式化
 * @param {Array} [props.functionButtons] - 功能挂件组：位于表格上方的操作按钮，可直接操控表格状态
 * @param {Array} props.columns - 零部件初始清单 (别名: modalColumns)
 * @param {Object} [props.initialParams={}] - 初始战备物资：定义的初始搜索参数
 * @param {boolean|Object} [props.modalPagination=true] - 局部后勤协议：弹窗内是否开启分页
 *
 * @example
 * <MyModalTable
 *   title="关联用户片段"
 *   api={async params=>await fetchUsers(params)}
 *   setModalForm={setModal} // 💡 借用主页面的表单构筑舱
 *   operate={({ refresh, setModalForm }) => ({ label: '详情', onClick: (rec) => setModalForm(...) })}
 * />
 */
export const MyModalTable = ({ api, onOk, title, width, footer, visible, operate, setModal, formItems, setModalForm, rowSelection, formatResponse, functionButtons, columns: modalColumns, initialParams = {}, modalPagination = true }) => {

    const [pending, setPending] = useState(false)

    /**
     * @description [独立信号链路]
     * 在弹窗内部启动专属的 useTableQuery，实现了与主页面逻辑的“物理隔绝”。
     */
    const { total, loading, columns, dataSource, search, refresh, setLoading, setSearch, setDataSource } = useTableQuery({ api, cols: modalColumns, initialParams, formatResponse })

    const handleSearch = values => setSearch({ ...search, ...values, pageNo: 1 })

    const handleTableChange = (pagination, filters, sorter) => setSearch({ ...search, pageNo: pagination.current, pageSize: pagination.pageSize, orderBy: sorter.column ? sorter.field : undefined })

    /**
     * @async
     * @function handleOk
     * @description [确认指令闭环] 执行确认操作并启动原子级锁定（Pending），防止重复指令干扰。
     */
    const handleOk = async () => {
        if (onOk) {
            try {
                setPending(true)
                await onOk()
            } catch (error) {
                console.log('操作失败:', error)
            } finally {
                setPending(false)
            }
        }
    }

    /**
     * @constant finalColumns
     * @description [火力全开] 将 Hook 生成的动态列与指挥官注入的 operate 操作列进行物理合并。
     */
    const finalColumns = useMemo(() => {
        return operate ? columns.concat(operate({ refresh, setModalForm })) : columns
    }, [columns, operate])

    return (
        <Modal centered destroyOnClose title={title} width={width} open={visible} onOk={handleOk} footer={footer} onCancel={() => setModal({ visible: false })} confirmLoading={pending}>
            {/*
                💡 [地堡战术细节]
                syncUrlParams={false}：确保弹窗内的搜索行为不会干扰全局 URL 信号。
            */}
            {formItems?.length > 0 && <MySearchForm search={search} formItems={formItems} setSearch={handleSearch} syncUrlParams={false} />}
            {/*
                💡 [高阶赋能逻辑]
                functionButtons 能够获得对当前表格状态 (refresh, setLoading...) 的完全控制权。
            */}
            {functionButtons?.length > 0 && <Space>{functionButtons.map(item => <Button key={item.name} type={item.type} onClick={() => item.onClick({ refresh, setLoading, setSearch, setDataSource })}>{item.name}</Button>)}</Space>}
            <MyTable
                total={total}
                search={search}
                loading={loading}
                scroll={{ y: 400 }}
                columns={finalColumns}
                dataSource={dataSource}
                rowSelection={rowSelection}
                pagination={modalPagination}
                onChange={handleTableChange}
                setDataSource={setDataSource}
            />
        </Modal>
    )
}