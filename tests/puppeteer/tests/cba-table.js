const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-table caption="Actions">
  <cba-column name="data" width="33%">data</cba-column>
  <cba-column name="event" width="33%">event</cba-column>
  <cba-column name="value" width="33%">value</cba-column>
</cba-table>`,
  js: ["cba-table/cba-table.js"]
}

const {CbaTable} = require("../classes/CbaTable");
const cbaTable = new CbaTable("cba-table");

beforeEach(async () =>
{
  await cbaTable.setItems([]);
});

it(".list property populates, gets items and render cba-table with row items", async() =>
{
  const items = await prepopulatedItems();
  const populatedItems = await cbaTable.getItems();
  deepEqual(populatedItems[0], items[0]);
  deepEqual(await cbaTable.getDomRowTexts(items[0].id), items[0].texts);
  deepEqual(populatedItems[1], items[1]);
  deepEqual(await cbaTable.getDomRowTexts(items[1].id), items[1].texts);
  notDeepEqual(populatedItems[2], items[2], "Sets missing ID");
  deepEqual(await cbaTable.getDomRowTexts(populatedItems[2].id), items[2].texts);
});

it("getItem should get a specific row record", async() =>
{
  const items = await prepopulatedItems();
  deepEqual(await cbaTable.getItem(items[0].id), items[0]);
});

it("addRow method ads new row item", async() =>
{
  const newRow = {
    data: "Info",
    texts: {
      data: "Added Data",
      event: "Added Event",
      value: "Added Value"
    },
    id: "addedRow1"
  };
  await cbaTable.addRow(newRow);
  const populatedItems = await cbaTable.getItems();
  deepEqual(populatedItems[0], newRow);
  deepEqual(await cbaTable.getDomRowTexts(newRow.id), newRow.texts);
});

it("updateRow should update a specific row record", async() =>
{
  const oldRow = {
    data: "Info",
    texts: {
      data: "Old Data",
      event: "Old Event",
      value: "Old Value"
    },
    id: "addedRow1"
  };
  const newRow = {
    data: "Info",
    texts: {
      data: "New Data",
      event: "New Event",
      value: "New Value"
    },
    id: "newRow1"
  };
  await cbaTable.addRow(oldRow);
  await cbaTable.updateRow(newRow, oldRow.id);
  notOk(await cbaTable.getDomRowTexts(oldRow.id));
  deepEqual(await cbaTable.getDomRowTexts(newRow.id), newRow.texts);
  const items = await cbaTable.getItems();
  deepEqual(items[0], newRow);
});

it("deleteRow should delete specific row", async() =>
{
  const items = await prepopulatedItems();
  await cbaTable.deleteRow(items[0].id);
  equal(await cbaTable.getItem(items[0].id), false);
  equal(await cbaTable.getDomRowTexts(items[0].id), false);
});

it("selectRow should Highlight a specific item ", async() =>
{
  const items = await prepopulatedItems();
  await cbaTable.selectRow(items[0].id);
  deepEqual(await cbaTable.getHighlightedTexts(), items[0].texts);
  equal((await cbaTable.getItem(items[0].id)).selected, true);
});

it("selectNextRow and selectPreviousRow should switch highlighting accordingly", async() =>
{
  const items = await prepopulatedItems();
  await cbaTable.selectRow(items[0].id);
  deepEqual(await cbaTable.getHighlightedTexts(), items[0].texts);
  await cbaTable.selectNextRow();
  deepEqual(await cbaTable.getHighlightedTexts(), items[1].texts);
  await cbaTable.selectNextRow();
  deepEqual(await cbaTable.getHighlightedTexts(), items[2].texts);
  await cbaTable.selectNextRow();
  deepEqual(await cbaTable.getHighlightedTexts(), items[0].texts);
  await cbaTable.selectPreviousRow();
  deepEqual(await cbaTable.getHighlightedTexts(), items[2].texts);
  await cbaTable.selectPreviousRow();
  deepEqual(await cbaTable.getHighlightedTexts(), items[1].texts);
});

it("Keyboard navigation should change highlighted rows accordingly", async() =>
{
  const items = await prepopulatedItems();
  await cbaTable.clickItem(items[0].id);
  deepEqual(await cbaTable.getHighlightedTexts(), items[0].texts);
  await page().keyboard.press("ArrowDown");
  deepEqual(await cbaTable.getHighlightedTexts(), items[1].texts);
  await page().keyboard.press("ArrowUp");
  deepEqual(await cbaTable.getHighlightedTexts(), items[0].texts);
});

async function prepopulatedItems()
{
  const items = [];
  for (let index = 1; index <= 3; index++) {
    const item = {
      id: "row" + index,
      data: "Info",
      texts: {
        data: "Data" + index,
        event: "Event" + index,
        value: "Value" + index
      }
    };
    if (index == 3)
      delete item.id;
    items.push(item);
  }
  await cbaTable.setItems(items);
  return items;
}

module.exports = {pageSetup};
