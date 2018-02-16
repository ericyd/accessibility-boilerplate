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

const pixelmatch  = require('pixelmatch');
const PNG         = require('pngjs').PNG;
// const chai        = require('chai');

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

            /* Using Blink Diff
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
            */

            /* using pixelmatch */
            compareScreenshots(expectedFilePath, actualFilePath, resultFilePath)
                .then(numDiffPixels => {
                    addContext(_this, `diff file: "${resultFilePath}"`);
                    addContext(_this, `file:///${resultFilePath}`);

                    assert.equal(numDiffPixels, 0, `${file} doesn't match the expected screenshot`);
                    done();
                })
                .catch(done);
        });
    });
});

console.info("Run `npm run open` to view your results after this script completes!");



function compareScreenshots(expectedFilePath, actualFilePath, resultFilePath) {
    return new Promise((resolve, reject) => {
        
      const img1 = fs.createReadStream(actualFilePath).pipe(new PNG()).on('parsed', doneReading);
      const img2 = fs.createReadStream(expectedFilePath).pipe(new PNG()).on('parsed', doneReading);
  
      let filesRead = 0;
      function doneReading() {
        // Wait until both files are read.
        if (++filesRead < 2) return;
  
        // The files should be the same size.
        // expect(img1.width, 'image widths are the same').equal(img2.width);
        // expect(img1.height, 'image heights are the same').equal(img2.height);
  
        // Do the visual diff.
        const diff = new PNG({width: img1.width, height: img2.height});
        const numDiffPixels = pixelmatch(
            img1.data, img2.data, diff.data, img1.width, img1.height,
            {threshold: 0.1});

        diff.pack().pipe(fs.createWriteStream(resultFilePath));
  
        // The files should look the same.
        // expect(numDiffPixels, 'number of different pixels').equal(0);
        resolve(numDiffPixels);
      }
    });
  }
  