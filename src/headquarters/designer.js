module.exports = ({ template, logistics }) => {

    const fs = require('fs')
    const path = require('path')
    const Handlebars = require('handlebars')

    Handlebars.registerHelper('raw', opt => opt.fn())
    Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(logistics.formater.contextStringify({ context, maxLength })) : '[]')

    const { hbsDir } = logistics.supporter.getConfig()
    const tplDir = !!hbsDir ? path.join(process.cwd(), hbsDir) : path.join(__dirname, `../workshop/${template}/blueprint`)
    const moldsDir = !!hbsDir ? path.join(process.cwd(), hbsDir, 'molds') : path.join(__dirname, `../workshop/${template}/blueprint/molds`)

    fs.readdirSync(moldsDir).forEach(file => {
        if (file.endsWith('.hbs')) {
            const name = path.basename(file, '.hbs')
            const content = fs.readFileSync(path.join(moldsDir, file), 'utf-8')
            Handlebars.registerPartial(name, `${content}\n`)
        }
    })

    return {
        indexTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8')),
        resourceTpl: Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8')),
    }
}