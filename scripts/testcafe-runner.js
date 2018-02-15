
const fs             = require('fs');
const path           = require('path');
const createTestCafe = require('testcafe');
const config         = require('../config');
let testcafe         = null;
require('./add-directories'); // runs on `require`

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        const runner = testcafe.createRunner();
        return runner
            .screenshots(config.screenshotDir, false)
            .src('./scripts/testcafe-setup-fixtures.js')
            .browsers(config.browsers)
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ', failedCount) 
        testcafe.close();
    });