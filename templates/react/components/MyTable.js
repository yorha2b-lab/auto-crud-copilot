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


    const hasScrolled = useRef(false)

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
        if (hasScrolled.current || !query || !autoScroll || !dataSource?.length) return
        if (query && autoScroll && dataSource?.length > 0) {
            const timer = setTimeout(() => {
                const trList = document.getElementsByClassName('ant-table-row')
                const tr = trList[Number(query.rowIndex)]
                if (tr) {
                    tr.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
                    tr.style.transition = 'background-color 0.8s ease'
                    tr.style.backgroundColor = '#e6f4ff'
                    hasScrolled.current = true
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [dataSource])

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