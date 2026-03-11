import { Table } from 'antd'
import { useEffect } from 'react'
import { EditableRow, EditableCell } from './EditableCell'

const components = {
    body: {
        row: EditableRow,
        cell: EditableCell,
    }
}

export const MyTable = ({ size, query, onSave, autoScroll, onChange, pagination, rowClassName, columns = [], rowSelection, rowKey = 'id', loading = false, dataSource = [], editable = false, scroll = { x: 'max-content' }, ...restProps }) => {

    const mergedColumns = columns.map(col => {
        if (!col.editType) {
            return col
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                title: col.title,
                rules: col.rules,
                handleSave: onSave,
                options: col.options,
                editType: col.editType,
                editable: !!col.editType,
                dataIndex: col.dataIndex,
            }),
        }
    })

    useEffect(() => {
        /* if (query && autoScroll) {
            //如果需要可以在这里通过query来处理滚动到目标行的操作
            const trList = document.getElementsByClassName('ant-table-row')
            const index = 0 //根据query来计算索引
            const tr = trList[index]
            if (tr) {
                tr.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
            }
        } */
    }, [])

    return (
        <Table
            {...restProps}
            rowKey={rowKey}
            scroll={scroll}
            loading={loading}
            onChange={onChange}
            columns={mergedColumns}
            dataSource={dataSource}
            pagination={pagination}
            size={size ?? 'middle'}
            rowSelection={rowSelection}
            components={editable ? components : undefined}
            rowClassName={editable ? () => 'editable-row' : rowClassName}
        />
    )
}