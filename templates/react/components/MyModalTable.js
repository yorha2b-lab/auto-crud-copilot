import { Modal } from 'antd'
import { MyTable } from './MyTable'
import { MySearchForm } from './MySearchForm'
import { useTableQuery } from '../hooks/useTableQuery'


export const MyModalTable = ({ api, onOk, title, width, footer, visible, columns, setModal, formItems, rowSelection, formatResponse }) => {

    const { total, loading, dataSource, search, setSearch } = useTableQuery(api, formatResponse, {})

    const handleSearch = values => setSearch({ ...search, ...values, pageNo: 1 })

    const handleTableChange = (pagination, filters, sorter) => setSearch({ ...search, pageNo: pagination.current, pageSize: pagination.pageSize, orderBy: sorter.column ? sorter.field : undefined })

    const handleOk = () => {
        if (onOk) {
            onOk()
        }
        setModal({ visible: false })
    }

    return (
        <Modal centered destroyOnHidden title={title} width={width} open={visible} onOk={handleOk} footer={footer} onCancel={() => setModal({ visible: false })}>
            {formItems?.length > 0 && <MySearchForm search={search} formItems={formItems} setSearch={handleSearch} />}
            <MyTable
                loading={loading}
                columns={columns}
                scroll={{ y: 400 }}
                dataSource={dataSource}
                rowSelection={rowSelection}
                onChange={handleTableChange}
                pagination={{ total: total, showSizeChanger: true, current: search.pageNo, pageSize: search.pageSize }} />
        </Modal>
    )
}