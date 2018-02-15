const fs = require('fs');
const pug = require('pug');

function renderAudit(files) {
    // Compile the source code
    const compiledFunction = pug.compileFile('templates/main.pug');
    
    // Render a set of data
    const html = compiledFunction({
        files: files
    });
    
    fs.mkdir('accessibility-audit', err => {
        if (err && err.message.indexOf('file already exists') === -1) throw err;

        fs.writeFile('accessibility-audit/results.html', html, function(err) {
            if (err) throw err;
        });
        fs.writeFile('accessibility-audit/resultsJSON.json', JSON.stringify(files), function(err) {
            if (err) throw err;
        });
    });
    console.info("Run `npm run open` to view your audit results!");
}

module.exports = renderAudit;