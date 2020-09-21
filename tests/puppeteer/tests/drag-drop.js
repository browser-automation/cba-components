const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const {CbaList} = require("../classes/CbaList");
const cbaList = new CbaList("cba-list");

const {CbaTable} = require("../classes/CbaTable");
const cbaTable = new CbaTable("cba-table");

const pageSetup = {
  body: `
  <cba-table caption="Actions" droppable="true" reorder="true">
    <cba-column text="texts.data" width="33%">data</cba-column>
    <cba-column text="texts.event" width="33%">event</cba-column>
    <cba-column text="texts.value" width="33%">value</cba-column>
  </cba-table>
  <cba-list id="dnd-list" drag="true"></cba-list>
`,
  js: ["cba-table/cba-table.js", "cba-list/cba-list.js"]
}

beforeEach(async () =>
{
  await cbaTable.setItems([]);
});

it("Dragging cba-list and dropping to cba-table add item and trigger's 'dragndrop' event with info", async function()
{
  const cbaListItems = await populateCbaList();
  const cbaTableItems = await populateCbaTable();
  const cbaListId = await cbaList.getId();
  const handle = await cbaList.getRowHandle(cbaListItems[0].id);
  const data = await triggerDragStart(handle);
  equal(data, `${cbaTableItems[0].id}#${cbaListId}`);

  const {dropRowId, dragRowId, dragId, reordered} = await triggerDrop(cbaTableItems[1].id, data);
  equal(dragRowId, cbaListItems[0].id);
  equal(dropRowId, cbaTableItems[1].id);
  equal(dragId, cbaListId);
  notOk(reordered)

  await itemIsRenderedOnRowIndex(cbaListItems[0].data, 2);
});

it("Reordering cba-table row reorders and trigger's 'dragndrop' event with info", async function()
{
  const cbaTableItems = await populateCbaTable();
  const handle = await cbaTable.getRowHandle(cbaTableItems[2].id);
  const data = await triggerDragStart(handle);
  equal(data, `${cbaTableItems[2].id}#`);

  const {dropRowId, dragRowId, reordered} = await triggerDrop(cbaTableItems[0].id, data);
  equal(dragRowId, cbaTableItems[2].id);
  equal(dropRowId, cbaTableItems[0].id);
  ok(reordered)

  await itemIsRenderedOnRowIndex(cbaTableItems[2], 0);
  await itemIsRenderedOnRowIndex(cbaTableItems[0], 1);
  await itemIsRenderedOnRowIndex(cbaTableItems[1], 2);
});

async function populateCbaList()
{
  const items = [];
  for (let index = 1; index <= 3; index++) {
    const item = {
      id: "row" + index,
      data: {
        texts: {
          data: `List Data${index}`,
          event: `List Event${index}`,
          value: `List Value${index}`
        }
      },
      text: `row${index}`
    };
    if (index == 3)
      delete item.id;
    items.push(item);
  }
  await cbaList.setItems(items);
  return items;
}

async function populateCbaTable()
{
  const items = [];
  for (let index = 1; index <= 4; index++) {
    const item = {
      id: `row${index}`,
      data: "Info",
      texts: {
        data: `Data${index}`,
        event: `Event${index}`,
        value: `Value${index}`
      }
    };
    if (index == 4)
      delete item.id;
    items.push(item);
  }
  await cbaTable.setItems(items);
  return items;
}

async function triggerDrop(id, data)
{
  const handle = await cbaTable.getRowHandle(id);
  const table = await cbaTable._getHandle();
  return handle.evaluate((cbaTableRow, cbaTable, data) => {
    return new Promise((resolve) => {
      cbaTable.addEventListener('dragndrop', ({detail}) =>
      {
        return resolve(detail);
      })
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", data);
      const event = new DragEvent("drop", {
        bubbles: true,
        dataTransfer
      });
      cbaTableRow.dispatchEvent(event);
    });
    
  }, table, data);
}

async function triggerDragStart(handle)
{
  return handle.evaluate((row) => {
    const event = new DragEvent("dragstart", {
      bubbles: true,
      dataTransfer: new DataTransfer()
    });
    row.dispatchEvent(event);

    return event.dataTransfer.getData("text/plain");
  });
}

async function itemIsRenderedOnRowIndex({texts}, index)
{
  deepEqual(await cbaTable.getDomRowIndexText(index), [texts.data, texts.event, texts.value]);
}

function wait(milliseconds = 200)
{
  return page().waitFor(milliseconds);
}

module.exports = {pageSetup};
