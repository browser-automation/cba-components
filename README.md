# Web components for chromium browser automation

[![Build Status](https://travis-ci.com/browser-automation/cba-components.svg?branch=master)](https://travis-ci.com/browser-automation/cba-components)

Collection of web components to be used in the [CBA](http://chrome-automation.com/):

- [cba-list](https://cba-components.netlify.app/smoke/cba-list) - Single column list.
- [cba-table](https://cba-components.netlify.app/smoke/cba-table) - Multi column table.
- [drag-drop](https://cba-components.netlify.app/smoke/drag-drop) - Drag and dropping cba-list to cba-table example.
- [cba-tooltip](https://cba-components.netlify.app/smoke/cba-tooltip) - A tooltip with header, text and link, that automatically calculate opening directions.
- [cba-tabs](https://cba-components.netlify.app/smoke/cba-tabs) - Tabs component for switching between different panels.
- [cba-button](https://cba-components.netlify.app/smoke/cba-button) - A regular styled button.

## Development

The code for the components can be found in the [src](src) directory.

### Installation

```bash
npm install
```

### Smoke tests

```bash
npm start # Starts development server
```

After launching command above navigate to
[http://localhost:3000/smoke/](http://localhost:3000/smoke) and select a
component for smoke testing, for example if you are looking for smoke testing
`cba-list` then
[http://localhost:3000/smoke/cba-list/](http://localhost:3000/smoke/cba-list/)
is the page you are looking for, various smoke test implementations can be found
at [tests/smoke](tests/smoke) directory.

**Note:** currently smoke tests are also used for documenation purpose. 

### Automated tests

```bash
npm test # Launch puppeteer tests
```

The implementation for the puppeteer tests can be found at:
- [tests/puppeteer](tests/puppeteer) - Main directory.
- [tests/puppeteer/classes](tests/puppeteer/classes) - Abstractions and helpers.
- [tests/puppeteer/tests](tests/puppeteer/tests) - Actual tests.
- [tests/puppeteer/main.js](tests/puppeteer/main.js) - Various configurations.

## Import

```bash
npm install privacy-manager-components
cba-components # Build and import components
cba-components --single-bundle # Build and import components into single file
# Specify components to import
cba-components --comp pm-table --comp pm-toggle
cba-components --output dirname # Specifies output folder
```
