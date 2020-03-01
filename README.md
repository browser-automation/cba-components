# Web components for chromium browser automation

## Development

```
npm start // Starts server
npm test // Launch puppeteer tests
```

## Import

```
npm install privacy-manager-components
pm-components // Build and import components
pm-components --single-bundle // Build and import components into single file
// Specify components to import
pm-components --comp pm-table --comp pm-toggle
pm-components --output dirname // Specifies output folder
```

## Structure

- [src/components](src/components) - Source codes
- [tests/smoke](tests/smoke) - Smoke tests
- [tests/puppeteer](tests/puppeteer) - Automated tests
