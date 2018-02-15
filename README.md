# WCAG Visreg
A (poorly named) set of scripts to automate accessibility testing (aiming at WCAG Level 2.0 AA compliance) and visual regression ("visreg") testing



## Setup

```bash
git clone https://github.com/ericyd/wcag-visreg
cd wcag-visreg
npm install
```

This is more of a boilerplate than a stand-alone module, but with a little configuration it can do a lot of work for you.

If you want to save screenshots, be aware that the `.gitignore` ignores the `screenshots` directory by default



## Usage

Ideally, the only thing you should have to touch is the `config.js` file in the directory root.

After that, you have some scripts to choose from:
* `npm t`: runs all test scripts, see [running tests](#running-tests) for more details
* `npm run cleanup`: deletes any captured screenshots and html
* 



## Adding expected images

1. Update the screenshots directory in `config.js` 
2. `npm run capture`
3. Reset `config.js`

### Step 1: Update the screenshots directory in `config.js` 

Visual regression testing assumes that there is an expected standard against which the new UI will be compared.

These screenshots will need to be recorded and optionally saved for future test runs.

At this time, the method to save the "expected" images is to change the `./config.js` file to point the screenshotsDir to `screenshots/expected`.

```js
// default config.js
module.exports = {
	...
	screenshotDir: 'screenshots/actual',
	...
}
```

```js
// modified config.js for saving your expected UI screenshots
module.exports = {
	...
	// in addition to screenshots, change any other info necessary if using different environments
	screenshotDir: 'screenshots/expected',
	...
}
```

### Step 2: `npm run capture`

Then run `npm run capture` to capture the screenshots.

### Step 3: Reset `config.js`

After running, change screenshotsDir back to `screenshots/actual`.




## Running tests

`npm t`

This will do the following:
1. Delete HTML and screenshots that were saved during the last test run
2. Capture screenshots and HTML from the pages specified in `./config.js`
3. Compare screenshots in `screenshots/actual` to `screenshots/expected` and fail any that do not match
4. Run an accessibility audit using [pa11y](https://github.com/pa11y/pa11y) on the saved HTML files and generate an issues report

When the test script is done, you can run `npm run open` to quickly open the reports.



## Configuration

Most of the manual adjustments should happen in the `config.js` file in the directory root.

These are all the possible options

* **browsers** `<Array<string>>`

	An array of browsers to use in the tests. [Full options in documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/browsers/browser-support.html#officially-supported-browsers).

	Note that you can use Chrome and Firefox in headless mode with `chrome:headless` and `firefox:headless`

* **skipScreenshots** `<boolean>`

	When true, do not capture or compare screenshots

* **skipWCAG** `<boolean>`

	When true, do not capture page HTML or run accessibility audit

* **screenshotDir** `<string>`

	Specify the directory in which to save the screenshots

* **singlePage** `<string>` | `<Object>`

	Specify a single page to test. If specified, this will skip all `public` and `auth` pages

	If `singlePage` is public, just provide a `string` identifying the URL.

	If `singlePage` is an authenticated page, provide an `object` with most of the properties from `auth`: `baseURL`, `loginURL`, `un`, `pw` (see below for details)

* **public** `<Object>`

	Define properties for public pages

	Properties:

	* **baseURL** `<string>`

		Path segments will be appended to the `baseURL` to generate the page under test

	* **paths** `<Array<string>>`

		Path segments to indicate which pages to visit. Include `''` to include the `baseURL`

	* **skip** `<boolean>` Default: `false`

		When true, public pages will not be tested

* **auth** `<Object>`

	Define properties for authenticated pages

	Properties:

	* **baseURL** `<string>`

		Path segments will be appended to the `baseURL` to generate the page under test

	* **loginURL** `<string>`

		Page to visit to log in before navigating to authenticated page. If ommitted, `auth.baseURL` will be used

	* **un** `<Object>`

		Properties for username entry

		* **selector** `<string>`

			CSS selector to indicate the username form element

		* **value** `<string>`

			Username for authentication

	* **pw** `<Object>`

		Properties for password entry

		* **selector** `<string>`

			CSS selector to indicate the password form element

		* **value** `<string>`

			password for authentication

	* **paths** `<Array<string>>`

		Path segments to indicate which pages to visit. Include `''` to include the `baseURL`

	* **skip** `<boolean>` Default: `false`

		When true, authenticated pages will not be tested

* **resolutions** `<Array<Array<number>>>`

	An array of two-element arrays defining `[width, height]` of screen resolutions for screenshot capture

	Default:
	```
	[
		[1920, 1080],
		[1600, 900],
		[1440, 900],
		[1440, 1024],
		[1366, 768],
		[1280, 1024],
		[1280, 800],
		[1024, 768],
		[768, 1024],
		[320, 480]
	]
	```

