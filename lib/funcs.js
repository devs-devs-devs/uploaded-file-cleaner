const fs = require('fs');
const path = require('path');
const me = path.basename(__filename);

module.exports = (() => fs.readdirSync(__dirname).forEach(file => {
    if (file === me) return;
    global[file.split('.')[0]] = require(path.resolve(__dirname, file));
}, {}))();