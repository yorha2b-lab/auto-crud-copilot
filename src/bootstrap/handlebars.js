module.exports = ({ config, template, contextStringify }) => {

    const fs = require('fs')
    const path = require('path')
    const Handlebars = require('handlebars')

    Handlebars.registerHelper('raw', opt => opt.fn())
    Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(contextStringify({ context, maxLength })) : '[]')

    const { hbsDir } = config
    const tplDir = hbsDir !== '' ? path.join(process.cwd(), hbsDir) : path.join(__dirname, `../framework/${template}/handlebars`)
    const partialsDir = hbsDir !== '' ? path.join(process.cwd(), hbsDir) : path.join(__dirname, `../framework/${template}/handlebars/partials`)

    fs.readdirSync(partialsDir).forEach(file => {
        if (file.endsWith('.hbs')) {
            const name = path.basename(file, '.hbs') // 去掉后缀拿名字
            const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8')
            Handlebars.registerPartial(name, `${content}\n`)
        }
    })

    return {
        indexTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8')),
        resourceTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8')),
    }
}