let tower

module.exports = accessPoint => {

    const { apiDoc, needMock, proxyTarget, enableAutoAlignment } = accessPoint.config

    if (!needMock && proxyTarget && enableAutoAlignment) {
        tower = require('../labs/tower')(accessPoint)
    }

    if (apiDoc && enableAutoAlignment) {
        require('../labs/linker')(accessPoint)
    }

    return {
        shutdown() {
            tower?.close()
        }

    }
}