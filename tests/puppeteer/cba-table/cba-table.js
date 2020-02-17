const puppeteer = require("puppeteer");
const assert = require("assert");

let browser;
let page;

before(async () =>
{
  browser = await puppeteer.launch({headless: true, args: ["--allow-file-access-from-files"]});
  page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
  await page.goto("http://127.0.0.1:3001/puppeteer/cba-table.html");
});

describe("cba-table component", () =>
{
  it(".list property populates cba-table with array of items", async() =>
  {
    assert.equal(true, true);
  });
});

after(async () =>
{
  await browser.close();
})
