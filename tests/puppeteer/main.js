const puppeteer = require("puppeteer");
const assert = require("assert");
const {join} = require("path");
const tests = [
  {path:"cba-list.js", name: "Testing CBA List"},
  {path:"cba-table.js", name: "Testing CBA Table"},
  {path:"drag-drop.js", name: "Testing drag and drop"},
  {path:"cba-list-sorting.js", name: "Testing CBA List sorting"}
];

let browser;
let page;

function run()
{
  for (const {path, name} of tests)
  {
    describe(name, () => {
      before(async () =>
      {
        browser = await puppeteer.launch({headless: true, args: ["--allow-file-access-from-files"]});
        page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
        await page.goto("http://127.0.0.1:3001/puppeteer");
      });
      it("testing", () =>
      {
        assert.equal(true, true);
      })
      after(async () =>
      {
        await browser.close();
      })
    });
  }
}

module.exports = {page: () => page, run};
