const assert = require("assert");
// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-list></cba-list>`,
  js: "cba-list/cba-list.js"
}

it(".list property populates and render cba-list with array of items", async() =>
{
  const items = [
    {
      id: "row1",
      data: "Info",
      text: "List1"
    },
    {
      id: "row2",
      data: "Info",
      text: "List2",
      subItems: [
        {
          id: "subrow1",
          data: "Info",
          text: "Sub List1"
        },
        {
          data: "Info",
          text: "Sub List2"
        }
      ]
    },
    {
      id: "row3",
      data: "Info",
      text: "List3"
    },
  ];
  await page().evaluate((items) => {
    document.querySelector("cba-list").items = items;
  }, items);

  assert.equal(true, true);
});

function wait(milliseconds = 200)
{
  page().waitFor(milliseconds);
}


module.exports = {pageSetup};
