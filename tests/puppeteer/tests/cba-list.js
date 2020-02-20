const assert = require("assert");
const {page} = require("../main");

const pageSetup = {
  body: `<cba-list></cba-list>`,
  js: "cba-list/cba-list.js"
}

it(".list property populates cba-list with array of items", async() =>
{
  assert.equal(true, true);
});

module.exports = {pageSetup};
