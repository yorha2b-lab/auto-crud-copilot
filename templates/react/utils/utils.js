import dayjs from 'dayjs'
import { request } from './request'

export const paramsFormat = params => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => ![null, undefined, ''].includes(v)))
    return new URLSearchParams(cleanParams).toString()
}

export const initOSS = async (url, options) => {
    const OSS = require('ali-oss')
    const crypto = require('crypto-js')
    const response = await request(url, options)
    const { bucket, endpoint, stsToken, expiration, accessKeyId, accessKeySecret } = response?.data || {}
    const client = new OSS({ bucket, endpoint, stsToken, accessKeyId, accessKeySecret })
    const policy = btoa(JSON.stringify({
        expiration,
        conditions: [
            ["content-length-range", 0, 1024 * 1024 * 1024],
        ],
    }))
    const signature = crypto.enc.Base64.stringify(crypto.HmacSHA1(policy, accessKeySecret))
    return { client, policy, signature, ...response?.data }
}

export const timeRender = ({ time, date, minute }) => {
    if (!time) {
        return ''
    } else {
        if (date) {
            return dayjs(time).format('YYYY-MM-DD')
        }
        if (minute) {
            return dayjs(time).format('YYYY-MM-DD HH:mm')
        }
        return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
}

export const moneyRender = (value, { decimals = 2, showSymbol = true } = {}) => {
    if (value === null || value === undefined || value === '') return '-'
    const number = Number(value)
    if (isNaN(number)) return '-'
    const options = showSymbol
        ? { style: 'currency', currency: 'CNY', minimumFractionDigits: decimals }
        : { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    return new Intl.NumberFormat('zh-CN', options).format(number)
}

export const exportDataToExcel = async (url, options, columns, fileName, resultKey = 'data') => {
    const response = await request(url, options)
    if (response?.[resultKey]?.length > 0) {
        const XLSX = require('xlsx')
        const datas = response?.[resultKey]?.map(item => Object.fromEntries(columns.map(col => {
            let value = item[col.dataIndex]
            if (col.exportRender) {
                value = col.exportRender(value, item, index)
            }
            if (col.render) {
                const rendered = col.render(value, item, index)
                value = typeof rendered === 'object' ? (rendered?.props?.children || value) : rendered
            }
            return [col.title, value]
        })))
        const workbook = XLSX.utils.book_new()
        const header = columns.map(item => item.title)
        const worksheet = XLSX.utils.json_to_sheet(datas, { header })
        worksheet['!cols'] = Array.from(new Array(header.length)).fill({ wpx: 120 })
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
        XLSX.writeFile(workbook, `${fileName}.xlsx`)
    }
}

export const formatUnit = (value, { k = 1024, units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'], decimals = 2 } = {}) => {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
        return `0 ${units[0] ?? ''}`
    }
    const i = Math.floor(Math.log(value) / Math.log(k))
    const index = Math.min(i, units.length - 1)
    const result = (value / Math.pow(k, index)).toFixed(decimals)
    return `${parseFloat(result)} ${units[index]}`
}