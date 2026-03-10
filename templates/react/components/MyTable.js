import { Table } from 'antd'
import { EditableRow, EditableCell } from './EditableCell'

const components = {
    body: {
        row: EditableRow,
        cell: EditableCell,
    }
}

export const MyTable = ({ size, onSave, onChange, pagination, rowClassName, columns = [], rowSelection, rowKey = 'id', loading = false, dataSource = [], editable = false, scroll = { x: 'max-content' }, ...restProps }) => {

    const mergedColumns = columns.map(col => {
        if (!col.editable) {
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