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
        await somePromise();
      });
      it("testing", () =>
      {
        assert.equal(true, true);
      })
      after(async () =>
      {
        await somePromise();
      })
    });
  }
}

function somePromise()
{
  return new Promise((resolve, reject) => {
    setTimeout( function() {
      resolve("Success!");
    }, 250) 
  })
}

module.exports = {page: () => page, run};
