const open = require('open');
const config = require('../config');

if (!config.skipWCAG) {
    open('accessibility-audit/results.html');
}
if (!config.skipScreenshots) {
    open('mochawesome-report/mochawesome.html');
}