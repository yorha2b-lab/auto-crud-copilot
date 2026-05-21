import { useState } from 'react'
import { MyTable } from './MyTable'
import { Modal, Space, Button } from 'antd'
import { MySearchForm } from './MySearchForm'
import { useTableQuery } from '../hooks/useTableQuery'


export const MyModalTable = ({ api, onOk, title, width, footer, visible, operate, setModal, formItems, setModalForm, rowSelection, formatResponse, functionButtons, columns: modalColumns, initialParams = {}, modalPagination = true }) => {

    const [pending, setPending] = useState(false)

    const { total, loading, columns, dataSource, search, refresh, setLoading, setSearch, setDataSource } = useTableQuery({ api, cols: modalColumns, initialParams, formatResponse })

    const handleSearch = values => setSearch({ ...search, ...values, pageNo: 1 })

    const handleTableChange = (pagination, filters, sorter) => setSearch({ ...search, pageNo: pagination.current, pageSize: pagination.pageSize, orderBy: sorter.column ? sorter.field : undefined })

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

    return (
        <Modal centered destroyOnClose title={title} width={width} open={visible} onOk={handleOk} footer={footer} onCancel={() => setModal({ visible: false })} confirmLoading={pending}>
            {formItems?.length > 0 && <MySearchForm search={search} formItems={formItems} setSearch={handleSearch} syncUrlParams={false} />}
            {functionButtons?.length > 0 && <Space>{functionButtons.map(item => <Button key={item.name} type={item.type} onClick={() => item.onClick({ refresh, setLoading, setSearch, setDataSource })}>{item.name}</Button>)}</Space>}
            <MyTable
                total={total}
                search={search}
                loading={loading}
                scroll={{ y: 400 }}
                dataSource={dataSource}
                rowSelection={rowSelection}
                pagination={modalPagination}
                onChange={handleTableChange}
                setDataSource={setDataSource}
                columns={operate ? columns.concat(operate({ refresh, setModalForm })) : columns}
            />
        </Modal>
    )
}