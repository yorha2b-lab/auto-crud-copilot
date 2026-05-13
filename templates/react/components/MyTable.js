import { Table } from 'antd'
import { useRef, useMemo, useEffect } from 'react'
import { EditableRow, EditableCell } from './EditableCell'

const components = {
    body: {
        row: EditableRow,
        cell: EditableCell,
    }
}

export const MyTable = ({ size, query, total, search, autoScroll, onChange, pagination, rowClassName, customSave, setDataSource, columns = [], rowSelection, rowKey = 'id', loading = false, dataSource = [], scroll = { x: 'max-content' }, ...restProps }) => {

    const tableRef = useRef(null)
    const hasScrolledRef = useRef(false)

    const isEditable = useMemo(() => columns.some(col => col.editType), [columns])

    const handleSave = row => {
        const newData = [...dataSource]
        const index = newData.findIndex(item => row[rowKey] === item[rowKey])
        const item = newData[index]
        newData.splice(index, 1, { ...item, ...row })
        setDataSource(newData)
        customSave?.({ ...item, ...row })
    }

    const paginationConfig = useMemo(() => {

        if (!pagination) return false

        return {
            total,
            showSizeChanger: true,
            current: search?.pageNo,
            pageSize: search?.pageSize,
            showTotal: (total) => `共 ${total} 条`,
            ...(typeof pagination === 'object' ? pagination : {})
        }
    }, [total, search, pagination])

    const mergedColumns = useMemo(() => {
        return columns.map(col => {
            if (!col.editType) {
                return col
            }
            return {
                ...col,
                onCell: (record) => ({
                    record,
                    handleSave,
                    title: col.title,
                    rules: col.rules,
                    options: col.options,
                    editType: col.editType,
                    editable: !!col.editType,
                    dataIndex: col.dataIndex,
                    placeholder: col.placeholder
                }),
            }
        })
    }, [columns])

    useEffect(() => {
        if (!autoScroll || !dataSource?.length || query?.rowIndex === undefined) return
        if (hasScrolledRef.current === query.rowIndex) return
        const timer = setTimeout(() => {
            const tableElement = tableRef.current
            if (!tableElement) return
            const trList = tableElement.getElementsByClassName('ant-table-row')
            const tr = trList[Number(query.rowIndex)]
            if (tr) {
                tr.scrollIntoView({ behavior: 'smooth', block: 'center' })
                tr.style.backgroundColor = '#e6f4ff'
                hasScrolledRef.current = query.rowIndex
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [dataSource, query?.rowIndex, autoScroll, tableRef])

    return (
        <div ref={tableRef}>
            <Table
                {...restProps}
                rowKey={rowKey}
                scroll={scroll}
                loading={loading}
                onChange={onChange}
                columns={mergedColumns}
                dataSource={dataSource}
                size={size ?? 'middle'}
                rowSelection={rowSelection}
                pagination={paginationConfig}
                components={isEditable ? components : undefined}
                rowClassName={(record, index) => {
                    const externalClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName
                    const classes = [externalClass]
                    if (isEditable) classes.push('editable-row')
                    if (autoScroll && query?.rowIndex === index) classes.push('search-highlight-row')
                    return classes.filter(Boolean).join(' ')
                }}
            />
        </div>
    )
}