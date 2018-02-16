/* ===========================================================
Test runner to perform image comparison on all screenshots captured.
Compared files from ./screenshots/expected to ./screenshots/actual.

When TestCafe scripts are run, they should output screenshots to ./screenshots/actual,
or the config object can be updated.

TODO: parallel test runners like Jest or Ava would make this a billion times faster, but
the mochawesome reporter is very helpful for inserting the diff screenshots. Investigate
other methods to generate reports.
=========================================================== */

import test from 'ava';

const fs          = require('fs');
const path        = require('path');
const assert      = require('assert');
const rimraf      = require('rimraf');
const open        = require('open');
const BlinkDiff   = require('blink-diff');

const pixelmatch  = require('pixelmatch');
const PNG         = require('pngjs').PNG;
const promisify   = require('promisify-node');

const expectedDir = path.resolve(path.dirname(__dirname), 'screenshots', 'expected');
const actualDir   = path.resolve(path.dirname(__dirname), 'screenshots', 'actual');
const resultDir   = path.resolve(path.dirname(__dirname), 'screenshots', 'result');
const config      = require('../config');
let files;

// test('test', t=> {
// 	t.pass();
// })

// remove thumnail dirs, no need to compare. Errors don't matter
try { rimraf.sync(path.resolve(actualDir, 'thumbnails')); } catch (e) {}
try { rimraf.sync(path.resolve(expectedDir, 'thumbnails')); } catch (e) {}

// expect.extend({
//     toPassLighthouse(received) {
  
//       const auditResults = Object.values(received.audits)
//       .filter((x) => !x.manual); // Strip manual audits. We don't care about those inside automated testing ;)
  
//       for (let result of auditResults)
//       {
//         let output = true;
  
//         if (!result.score) {
//           output = `${result.name} - ${result.description}`;
  
//           if (result.displayValue) {
//             output += ` - ${result.displayValue}`;
//           }
  
//           return {
//             message: () => output,
//             pass: false
//           };
//         }
//       }
  
//       return {
//         message: () => `expected to fail lighthouse`,
//         pass: true
//       }
//     },
//   });

(function() {
    if (config.skipScreenshots) {
        console.log('skipping screenshot comparison tests');
        return;
    };

    // this.timeout(10000);
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
        test(`file "${file}"`, async t => {
            // console.log('testing');
            // look for file of same name in actualDir
            // if err, fail test and do not continue
            try {
                fs.statSync(actualFilePath);
            } catch (e) {
                assert(false, `file not found: ${actualFilePath}`);
                t.fail();
                return;
            }

			const results = compareScreenshots(expectedFilePath, actualFilePath, resultFilePath);
			// const results = compareScreenshotsBlinkdiff(expectedFilePath, actualFilePath, resultFilePath);

			t.is(await results, 0);
            
        });
    });
})();

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
  
  

  function compareScreenshotsBlinkdiff(expectedFilePath, actualFilePath, resultFilePath) {

    return new Promise((resolve, reject) => {

        // setup diff
        var diff = new BlinkDiff({
            imageAPath: expectedFilePath,
            imageBPath: actualFilePath,
            imageOutputPath: resultFilePath,
            thresholdType: BlinkDiff.THRESHOLD_PERCENT,
            threshold: 0.01 // 1% threshold
        });
        diff.run(function (error, result) {
                if (error) reject(error);
                console.log('running');

                // display the diff file in each test, since it is already generated and we have a reference to it
                // context can be an image url and the report will show it inline
                // addContext(_this, `diff file: "${resultFilePath}"`);
                // addContext(_this, `file:///${resultFilePath}`);

                // assert(diff.hasPassed(result.code), `diff did not pass for ${file}`);
                resolve(diff.hasPassed(result.code));

                // done();
            });
    });
  }