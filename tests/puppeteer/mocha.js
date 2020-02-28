const puppeteer = require("puppeteer");
const assert = require("assert");

let browser;

describe("Test", () => {
  before(async () =>
  {
    browser = await puppeteer.launch({headless: true});
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
