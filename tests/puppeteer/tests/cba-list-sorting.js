const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-list sort="asc"></cba-list>`,
  js: ["cba-list/cba-list.js"]
}

const {CbaList} = require("../classes/CbaList");
const cbaList = new CbaList("cba-list");

beforeEach(async () =>
{
  await cbaList.setItems([]);
});

it("sort='asc' should sort items ascendingly", async() =>
{
  await prepopulatedItems();
  equal(await cbaList.getDomRowIndexText(0), "List1");
  equal(await cbaList.getDomRowIndexText(1), "List2");
  equal(await cbaList.getDomRowIndexText(2), "List3");
});

it("sort='desc' should sort items descendingly", async() =>
{
  
  await cbaList.setSort("desc");
  await prepopulatedItems();
  equal(await cbaList.getDomRowIndexText(0), "List3");
  equal(await cbaList.getDomRowIndexText(1), "List2");
  equal(await cbaList.getDomRowIndexText(2), "List1");
});


async function prepopulatedItems(expanded)
{
  const items = [
    {
      id: "row1",
      data: "Info",
      text: "List2"
    },
    {
      id: "row2",
      data: "Info",
      text: "List1",
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
      data: "Info",
      text: "List3"
    },
  ];
  if (expanded)
    items[1].expanded = true;
  await cbaList.setItems(items);
  return items;
}

module.exports = {pageSetup};
