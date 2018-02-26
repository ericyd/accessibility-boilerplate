/**
 * Add directories needed for test runs.
 */

const fs = require('fs');

const directoriesToAdd = [
    'screenshots',
    'html',
    config.screenshots.actual,
    config.screenshots.expected,
    config.screenshots.diff
]

directoriesToAdd.forEach(dir => {
    fs.mkdir(dir, err => {
        if (err && err.message.indexOf('file already exists') !== -1) return;
        if (err) console.error(err);
    });
});