const fs = require("fs");
function myProcessor(obj) {
	fs.writeFileSync('mytestresults.json', JSON.stringify(obj));
	return obj;
}

module.exports = myProcessor;