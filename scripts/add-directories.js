/**
 * Add directories needed for test runs.
 */

const fs = require('fs');

const directoriesToAdd = [
    'screenshots',
    'html',
    'screenshots/actual',
    'screenshots/result',
    'screenshots/expected'
]

directoriesToAdd.forEach(dir => {
    fs.mkdir(dir, err => {
        if (err && err.message.indexOf('file already exists') !== -1) return;
        if (err) console.error(err);
    });
});