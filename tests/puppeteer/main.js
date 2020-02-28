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
