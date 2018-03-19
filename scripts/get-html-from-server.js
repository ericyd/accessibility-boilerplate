const request = require("request-promise-native");
const fs = require("fs");
const path = require("path");
const util = require("util");
const config = require("../config");

// TODO: how to do auth urls that do not accept auth via request headers? (e.g. cookies)

(async () => {
  if (!config.getHTMLFromClient) {
    try {
      const writeFileAsync = util.promisify(fs.writeFile);

      // concat paths to get urls
      const urls = config.public.paths.map(path => config.public.baseURL + path);

      // marshall requests
      const requestPromises = urls.map(url => request(url));

      // perform requests
      const responses = await Promise.all(requestPromises);

      // marshall file writes
      const fileWritePromises = responses
        .map((res, i) => {
          const formattedURL = urls[i]
            .replace(/\/$/, '')
            .replace(/http[s]?\:\/\/w{0,3}\.?/, '')
            .replace(/[\/\?\&\=\.]/g, '-');
          const filename = path.join(path.dirname(__dirname), 'html', `${formattedURL}.html`);
          return writeFileAsync(filename, res);
        });

      // write files
      await Promise.all(fileWritePromises);
      // console.log(errors);
    } catch (e) {
      console.error(e);
    }
  }
})()
