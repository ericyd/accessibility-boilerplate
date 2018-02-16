class MyCustomReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onTestStart(test) {
        
    }

    onTestResult(test, testResult, aggregatedResult) {
        // testResultsProcessor 
        // reporters [array<moduleName | [moduleName, options]>]
        // ["default", "<rootDir>/my-custom-reporter.js"]
        // console.log(test);
        test.myCustomTestProp = "wow here it is!!! on the test!!!";
        testResult.myCustomResProp = "wow here it is!!!";
        // console.log(testResult);
        aggregatedResult.myCustomAgProp = "aggregate props for the win";
    }

    onRunStart(results, options) {
        // console.log(results);
    }

    onRunComplete(contexts, results) {
        // console.log(results);
        // console.log('Custom reporter output:');
        // console.log('GlobalConfig: ', this._globalConfig);
        // console.log('Options: ', this._options);
    }
}

module.exports = MyCustomReporter;