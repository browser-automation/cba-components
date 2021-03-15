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
  <cba-column text="texts$0" width="33%">data</cba-column>
  <cba-column text="event.name" width="33%">event</cba-column>
  <cba-column text="value" width="33%">value</cba-column>
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
  await itemIsRendered(items[0]);
  deepEqual(populatedItems[1], items[1]);
  await itemIsRendered(items[1]);
  notDeepEqual(populatedItems[2], items[2], "Sets missing ID");
  await itemIsRendered(populatedItems[2]);
});

it("Items with non matching 'text' attrbutes in cba-column add empty rows", async() =>
{
  const item = {id: "first-item-id"};
  await cbaTable.setItems([item]);
  deepEqual(await cbaTable.getDomRowTexts(item.id), ["", "", ""]);
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
    texts: ["Added Data"],
    event: {name: "Added Event"},
    value: "Added Value",
    id: "addedRow1"
  };
  await cbaTable.addRow(newRow);
  const populatedItems = await cbaTable.getItems();
  deepEqual(populatedItems[0], newRow);
  await itemIsRendered(newRow);
});

it("updateRow should update a specific row record", async() =>
{
  const oldRow = {
    data: "Info",
    texts: ["Old Data"],
    event: {name: "Old Event"},
    value: "Old Value",
    id: "addedRow1"
  };
  const newRow = {
    data: "Info",
    texts: ["New Data"],
    event: {name: "New Event"},
    value: "New Value",
    id: "newRow1"
  };
  await cbaTable.addRow(oldRow);
  await cbaTable.updateRow(newRow, oldRow.id);
  notOk(await cbaTable.getDomRowTexts(oldRow.id));
  await itemIsRendered(newRow);
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
  await itemIsHighlighted(items[0]);
  equal((await cbaTable.getItem(items[0].id)).selected, true);
});

it("Hovering table row dispatches rowhover event with the rowId in details", async() =>
{
  const items = await prepopulatedItems();
  const rowHandle = await cbaTable.getRowHandle(items[0].id);
  const cbaTableHandle = await cbaTable._getHandle();
  const detail = await cbaTableHandle.evaluate((cbaTable, row) => {
    return new Promise((resolve) => {
      cbaTable.addEventListener("rowhover", ({detail}) =>
      {
        return resolve(detail);
      });
      const mouseoverEvent = new MouseEvent("mouseover", {bubbles: true});
      row.dispatchEvent(mouseoverEvent);
    });
  }, rowHandle);
  equal(detail.rowId, items[0].id);
});

it("selectNextRow and selectPreviousRow should switch highlighting accordingly", async() =>
{
  const items = await prepopulatedItems();
  await cbaTable.selectRow(items[0].id);
  await itemIsHighlighted(items[0]);
  await cbaTable.selectNextRow();
  await itemIsHighlighted(items[1]);
  await cbaTable.selectNextRow();
  await itemIsHighlighted(items[2]);
  await cbaTable.selectNextRow();
  await itemIsHighlighted(items[0]);
  await cbaTable.selectPreviousRow();
  await itemIsHighlighted(items[2]);
  await cbaTable.selectPreviousRow();
  await itemIsHighlighted(items[1]);
});

it("Keyboard navigation should change highlighted rows accordingly", async() =>
{
  const items = await prepopulatedItems();
  await cbaTable.clickItem(items[0].id);
  await itemIsHighlighted(items[0]);
  await page().keyboard.press("ArrowDown");
  await itemIsHighlighted(items[1]);
  await page().keyboard.press("ArrowUp");
  await itemIsHighlighted(items[0]);
});

async function itemIsRendered(item)
{
  deepEqual(await cbaTable.getDomRowTexts(item.id), [item.texts[0], item.event.name, item.value]);
}

async function itemIsHighlighted(item)
{
  deepEqual(await cbaTable.getHighlightedTexts(), [item.texts[0], item.event.name, item.value]);
}

async function prepopulatedItems()
{
  const items = [];
  for (let index = 1; index <= 3; index++) {
    const item = {
      id: "row" + index,
      data: "Info",
      texts: ["Data" + index],
      event: {name: "Event" + index},
      value: "Value" + index
    };
    if (index == 3)
      delete item.id;
    items.push(item);
  }
  await cbaTable.setItems(items);
  return items;
}

module.exports = {pageSetup};
