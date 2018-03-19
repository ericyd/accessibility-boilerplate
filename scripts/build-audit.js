const fs = require('fs');
const render = require('./render-accessibility-audit');

render(JSON.parse(fs.readFileSync('results.tmp.json')))