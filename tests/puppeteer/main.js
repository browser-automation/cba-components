const puppeteer = require("puppeteer");
const {join} = require("path");
const tests = [
  {path:"cba-list.js", name: "Testing CBA List"},
  {path:"cba-table.js", name: "Testing CBA Table"}
];

let browser;
let page;

function run()
{
  for (const {path, name} of tests)
  {
    describe(name, () => {
      const {pageSetup} = require(`./tests/${path}`);
      before(async () =>
      {
        browser = await puppeteer.launch({headless: true, args: ["--allow-file-access-from-files"]});
        page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
        await page.goto("http://127.0.0.1:3001/puppeteer");
        await page.addScriptTag({url: join("/", "js", pageSetup.js), type: "module"});
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
