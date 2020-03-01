# Web components for chromium browser automation

## Development

```
npm start // Starts server
npm test // Launch puppeteer tests
```

## Import

```
npm install privacy-manager-components
cba-components // Build and import components
cba-components --single-bundle // Build and import components into single file
// Specify components to import
cba-components --comp pm-table --comp pm-toggle
cba-components --output dirname // Specifies output folder
```

## Structure

- [src/components](src/components) - Source codes
- [tests/smoke](tests/smoke) - Smoke tests
- [tests/puppeteer](tests/puppeteer) - Automated tests
