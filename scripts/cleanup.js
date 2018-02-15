/**
 * Delete screenshots, diffs, and html from prior test run
 */

const rimraf = require('rimraf');

const directoriesToRemove = [
    'html',
    'screenshots/actual',
    'screenshots/result'
]

directoriesToRemove.forEach(dir => {
    rimraf(dir, err => {
        if (err && err.message.indexOf('file not found') !== -1) return;
        if (err) console.error(err);
    });
});
