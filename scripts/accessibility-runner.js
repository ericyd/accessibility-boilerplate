/* ===========================================================
Test runner to perform accessibility audits on saved HTML files.

Runs `pa11y` auditor on all files in the /html directory
=========================================================== */

// dependencies
const fs           = require('fs');
const path         = require('path');
const assert       = require('assert');
const renderAudit  = require('./render-accessibility-audit');
const wcagMap      = require('./wcag-map');
const pa11y        = require('pa11y');
const async        = require('async');
const config       = require('../config');
const pa11yOptions = {
    allowedStandards: ['WCAG2AA'], //Defaults to Section508, WCAG2A, WCAG2AA, and WCAG2AAA.
    ignore: [ // things to ignore, if desired
        // 'notice',
        // 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2'
    ]
};
const root         = path.dirname(__dirname);
const dir          = path.resolve(root, 'html')
// get list of files to audit
const files        = fs.readdirSync(dir);



const sortBy = prop => {
    return (a, b) => {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        } else {
            return 0;
        }
    }
}

// sort array of objects based on code property
const sortByCode = sortBy('code');

// group results based on code (i.e. the WCAG principle that it relates to)
const groupByPrinciple = (rawResults) => {
    var group = {};
    rawResults.forEach((instance) => {
        if (group[instance.code]) {
            group[instance.code].instances.push(
                {
                    type: instance.type,
                    context: instance.context,
                    selector: instance.selector,
                    // code: instance.code,
                    // message: instance.message,
                }
            );
        } else {
            group[instance.code] = {
                code: instance.code,
                title: instance.title,
                message: instance.message,
                instances: [
                    {
                        type: instance.type,
                        context: instance.context,
                        selector: instance.selector,
                        // code: instance.code,
                        // message: instance.message,
                    }
                ]
            }
        }
    })

    // merge object into array of objects
    return Object.values(group);
}

// group and sort results based on WCAG principle
const resultFilter = (rawResults, type) => {
    return groupByPrinciple(rawResults.filter(result => result.typeCode === type))
        .sort(sortByCode);
}

function processPa11yResults(err, testRunResults) {
    if (err) {
        console.error(err);
        // console.log(testRunResults);
    }
    // optionally write results to file
    if (process.argv.includes("writeFile")) {
        fs.writeFile('pa11y-results.tmp.json',
            JSON.stringify(testRunResults),
            err => (err && console.error(err))
        );
    }

    const fileResults = testRunResults.map((result, i, array) => {
        resultIssues = result.issues.map(issue => {
            let title = issue.code.split('.');
            title = {
                "principle": wcagMap.principle[title[1]],
                "guideline": wcagMap.guideline[title[2]],
                "rule": wcagMap.rule[title[3]]
            }
            return Object.assign(issue, {title: title});
        });

        // marshal the results array into categories
        const errors = resultFilter(resultIssues, 1);
        const warnings = resultFilter(resultIssues, 2);
        const notices = resultFilter(resultIssues, 3);
        categories = [
            {
                resultType: 'error',
                title: 'Errors',
                principles: errors
            },
            {
                resultType: 'warning',
                title: 'Warnings',
                principles: warnings
            },
            {
                resultType: 'notice',
                title: 'Notices',
                principles: notices
            }
        ];
        return {
            name: files[i],
            documentTitle: result.documentTitle,
            pageUrl: result.pageUrl,
            categories: categories
        }
        
    })
    
    // render the results into a static html doc
    renderAudit(fileResults);

    // optionally write results to file
    if (process.argv.includes("writeFile")) {
        fs.writeFile('results.tmp.json',
            JSON.stringify(fileResults),
            err => (err && console.error(err))
        );
    }
}

// pa11y returns an array of objects with the following shape:
// {
//  "documentTitle": "Doc title",
//  "pageUrl": "file:///C:/path/to/file.html",
//  "issues": [{
//      "code": "WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2",
//      "context": "<code-snippet>",
//      "message": "message pertaining to the code",
//      "selector": "css selector for relevant node",
//      "type": "error",
//      "typeCode": 1
//    },
//    ...
//  ]
// }
const applyPa11y = async file => {
    try {
        return await pa11y('file:///' + path.join(dir, file), pa11yOptions)
    } catch (e) {
        return {
            documentTitle: file,
            pageUrl: file,
            issues: [
                {
                    code: "Failed to complete Pa11y audit",
                    context: "",
                    message: e.message,
                    type: 'error',
                    typeCode: 1
                }
            ]
        }
    }
};

(function accessibilityAudit() {
    if (config.skipWCAG) {
        console.log('skipping accessibility audit');
        return;
    };

    // execute pa11y audit on each file
    async.map(files, applyPa11y, processPa11yResults);
})()
