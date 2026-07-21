module.exports = accessPoint => {

    const labs = {}

    const { apiDoc, needMock, proxyTarget, enableAutoAlignment } = accessPoint.config

    if (!needMock && proxyTarget && enableAutoAlignment) {
        labs.tower = require('../labs/tower')(accessPoint)
    }

    if (apiDoc && enableAutoAlignment) {
        labs.council = require('../labs/council')(accessPoint)
    }

    return labs
}