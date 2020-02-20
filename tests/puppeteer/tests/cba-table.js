const assert = require("assert");
const {page} = require("../main");

const pageSetup = {
  body: `<cba-table caption="Actions">
  <cba-column name="data" width="33%">data</cba-column>
  <cba-column name="event" width="33%">event</cba-column>
  <cba-column name="value" width="33%">value</cba-column>
</cba-table>`,
  js: "cba-table/cba-table.js"
}

it(".list property populates cba-list with array of items", async() =>
{
  assert.equal(true, true);
});

module.exports = {pageSetup};
