function getMetadata(t) {
    let browserName, prettyUrl;
    try {
        const browserInfo = t.testRun.browserConnection.browserInfo;
        browserName = browserInfo.providerName === 'locally-installed' ? browserInfo.browserName : browserInfo.providerName;
    } catch (e) {
        browserName = 'unknown_browser';
    }

    try {
        let pageUrl = t.testRun.test.pageUrl;
        // remove http://www., trailing slash, and any path/query delimiters
        prettyUrl = pageUrl
            .replace(/\/$/, '')
            .replace(/http[s]?\:\/\/w{0,3}\.?/, '')
            .replace(/[\/\?\&\=\.]/g, '-');
    } catch (e) {
        prettyUrl = 'could_not_parse_page_url';
    }

    return [browserName, prettyUrl];
}

module.exports = getMetadata;