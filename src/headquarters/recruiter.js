/**
 * YoRHa Bunker Construction System
 * This file is part of Bunker.
 * Bunker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * (c) 2026 [yorha2b-lab]. Glory to Mankind.
 */

const fs = require('fs')
const path = require('path')

module.exports = dir => Object.fromEntries(fs.readdirSync(dir).filter(file => file.endsWith('.js')).map(file => [path.basename(file, '.js'), require(path.join(dir, file))]))