import dayjs from 'dayjs'
import { request } from './request'

//常用工具函数，使用前确保已安装对应模块

export const initOSS = async (url, options) => {
    /* const OSS = require('ali-oss')
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
    return { client, policy, signature, ...response?.data } */
}

export const formatQuery = (params, formItems) => {
    const cleanParams = {}
    Object.keys(params).forEach(key => {
        if (formItems.some(item => item.name.includes(key) && item.type?.includes('date'))) {
            cleanParams[key] = Number(params[key])
        } else {
            cleanParams[key] = params[key] ?? null
        }
    })
    return cleanParams
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

export const exportDataToExcel = async (url, options, columns, fileName, formatter) => {
    /* const response = await request(url, options)
    const result = formatter ? formatter(response) : (response?.data ?? [])
    if (result?.length > 0) {
        const XLSX = require('xlsx')
        const datas = result.map(item => Object.fromEntries(columns.map(col => {
            let value = item[col.dataIndex]
            if (col.exportRender) {
                value = col.exportRender(value, item)
            }
            if (col.render) {
                const rendered = col.render(value, item)
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
    } */
}

export const moneyRender = (value, { decimals = 2, currency = 'CNY', language = 'zh-CN', showSymbol = true } = {}) => {
    if (value === null || value === undefined || value === '') return '-'
    const number = Number(value)
    if (isNaN(number)) return '-'
    const options = showSymbol
        ? { style: 'currency', currency, minimumFractionDigits: decimals }
        : { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    return new Intl.NumberFormat(language, options).format(number)
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