import { useRef, useState, useEffect, useCallback } from 'react'

export const useTableQuery = (api, formatResponse, initialParams = {}) => {

    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const [search, setSearch] = useState({ pageNo: 1, pageSize: 10, ...initialParams })

    const apiRef = useRef(api)
    const fetchIdRef = useRef(0)

    useEffect(() => {
        apiRef.current = api
    }, [api])

    const fetchData = useCallback(async () => {
        if (!apiRef.current) return
        setLoading(true)
        const currentFetchId = ++fetchIdRef.current
        try {
            const response = await apiRef.current(search)
            if (currentFetchId !== fetchIdRef.current) return
            setDataSource(formatResponse(response))
            setTotal(response?.total || 0)
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

    return { total, loading, dataSource, search, setSearch, refresh: fetchData }
}