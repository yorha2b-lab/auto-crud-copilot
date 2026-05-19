import { useRef, useState, useEffect, useCallback } from 'react'

export const useTableQuery = ({ api, cols = [], initialParams = {}, formatResponse }) => {

    const [total, setTotal] = useState(0)
    const [columns, setColumns] = useState(cols)
    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const [search, setSearch] = useState(initialParams)

    const apiRef = useRef(api)
    const fetchIdRef = useRef(0)

    useEffect(() => {
        apiRef.current = api
    }, [api])

    const getColumnSchema = cols => cols.map(col => ({ title: col.title, dataIndex: col.dataIndex })).join('|')

    const fetchData = useCallback(async () => {
        if (!apiRef.current) return
        setLoading(true)
        const currentFetchId = ++fetchIdRef.current
        try {
            const response = await apiRef.current(search)
            if (currentFetchId !== fetchIdRef.current) return
            const { data, total, columns: newCols } = formatResponse(response ?? {})
            if (newCols && getColumnSchema(newCols) !== getColumnSchema(columns)) {
                setColumns(newCols)
            }
            setDataSource(data)
            setTotal(total ?? 0)
        } catch (error) {
            console.error('查询失败', error)
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setLoading(false)
            }
        }
    }, [search])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { total, columns, loading, dataSource, search, setSearch, setDataSource, refresh: fetchData }
}