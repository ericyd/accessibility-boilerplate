/* ===========================================================
Test runner to perform image comparison on all screenshots captured.
Compared files from ./screenshots/expected to ./screenshots/actual.

When TestCafe scripts are run, they should output screenshots to ./screenshots/actual,
or the config object can be updated.

TODO: parallel test runners like Jest or Ava would make this a billion times faster, but
the mochawesome reporter is very helpful for inserting the diff screenshots. Investigate
other methods to generate reports.
=========================================================== */

const fs          = require('fs');
const path        = require('path');
const assert      = require('assert');
const rimraf      = require('rimraf');
const open        = require('open');
const BlinkDiff   = require('blink-diff');
const addContext  = require('mochawesome/addContext');
const expectedDir = path.resolve(path.dirname(__dirname), 'screenshots', 'expected');
const actualDir   = path.resolve(path.dirname(__dirname), 'screenshots', 'actual');
const resultDir   = path.resolve(path.dirname(__dirname), 'screenshots', 'result');
const config      = require('../config');
let files;


// remove thumnail dirs, no need to compare. Errors don't matter
try { rimraf.sync(path.resolve(actualDir, 'thumbnails')); } catch (e) {}
try { rimraf.sync(path.resolve(expectedDir, 'thumbnails')); } catch (e) {}


describe('screenshot comparisons', function() {
    if (config.skipScreenshots) {
        console.log('skipping screenshot comparison tests');
        return;
    };

    this.timeout(10000);
    try {
        files = fs.readdirSync(expectedDir);
    } catch (e) {
        throw new Error(`cannot find directory "${expectedDir}"`);
    }
    

    files.forEach(file => {
        const actualFilePath = path.join(actualDir, file);
        const expectedFilePath = path.join(expectedDir, file);
        const resultFilePath = path.join(resultDir, file);

        // define test
        it(`file "${file}"`, function(done) {
            const _this = this;
            // look for file of same name in actualDir
            // if err, fail test and do not continue
            try {
                fs.statSync(actualFilePath);
            } catch (e) {
                assert(false, `file not found: ${actualFilePath}`);
                done();
            }

            // setup diff
            var diff = new BlinkDiff({
                imageAPath: expectedFilePath,
                imageBPath: actualFilePath,
                imageOutputPath: resultFilePath,
                thresholdType: BlinkDiff.THRESHOLD_PERCENT,
                threshold: 0.01 // 1% threshold
            });

            // compare the files
            diff.run(function (error, result) {
                if (error) console.error(error);

                // display the diff file in each test, since it is already generated and we have a reference to it
                // context can be an image url and the report will show it inline
                addContext(_this, `diff file: "${resultFilePath}"`);
                addContext(_this, `file:///${resultFilePath}`);

                assert(diff.hasPassed(result.code), `diff did not pass for ${file}`);

                done();
            });
        });
    });
});

console.info("Run `npm run open` to view your results after this script completes!");