const puppeteer = require("puppeteer");
const {join} = require("path");
const tests = [
  {path:"cba-list.js", name: "Testing CBA List"},
  {path:"cba-list-new.js", name: "Testing CBA List new"},
  {path:"cba-table.js", name: "Testing CBA Table"},
  {path:"drag-drop.js", name: "Testing drag and drop"},
  {path:"cba-list-sorting.js", name: "Testing CBA List sorting"},
  {path:"cba-tooltip.js", name: "Testing CBA Tooltip"},
  {path:"cba-list-tooltip.js", name: "Testing CBA Tooltip inside cba-list"},
];

let browser;
let page;

function run()
{
  for (const {path, name} of tests)
  {
    describe(name, () =>
    {
      const {pageSetup} = require(`./tests/${path}`);
      before(async () =>
      {
        browser = await puppeteer.launch({headless: true, args: ["--allow-file-access-from-files"]});
        page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
        await page.goto("http://127.0.0.1:3001/puppeteer");
        for (const script of pageSetup.js)
        {
          await page.addScriptTag({url: join("/", "js", script), type: "module"});
        }
        await page.evaluate((bodyHTML) => document.body.innerHTML = bodyHTML, pageSetup.body);
      });
      after(async () =>
      {
        await browser.close();
      })
    });
  }
}

module.exports = {page: () => page, run};
