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
  <cba-table caption="Actions" droppable="true">
    <cba-column name="data" width="33%">data</cba-column>
    <cba-column name="event" width="33%">event</cba-column>
    <cba-column name="value" width="33%">value</cba-column>
  </cba-table>
  <cba-list id="dnd-list" draggable="true"></cba-list>
`,
  js: ["cba-table/cba-table.js", "cba-list/cba-list.js"]
}

beforeEach(async () =>
{
  await cbaTable.setItems([]);
});

it("Dragging cba-list and dropping to cba-table trigger's 'dragndrop' event with info", async function()
{
  const cbaListItems = await populateCbaList();
  const cbaTableItems = await populateCbaTable();
  const cbaListId = await cbaList.getId();
  const data = await triggerDragStart(cbaListItems[0].id);
  equal(data, `${cbaTableItems[0].id}#${cbaListId}`);

  const {dropRowId, dragRowId, dragId} = await triggerDrop(cbaTableItems[1].id, data);
  equal(dragRowId, cbaListItems[0].id);
  equal(dropRowId, cbaTableItems[1].id);
  equal(dragId, cbaListId);
});

async function populateCbaList()
{
  const items = [];
  for (let index = 1; index <= 3; index++) {
    const item = {
      id: "row" + index,
      data: {
        data: `List Data${index}`,
        event: `List Event${index}`,
        value: `List Value${index}`
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
  for (let index = 1; index <= 3; index++) {
    const item = {
      id: `row${index}`,
      data: "Info",
      texts: {
        data: `Data${index}`,
        event: `Event${index}`,
        value: `Value${index}`
      }
    };
    if (index == 3)
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

async function triggerDragStart(id)
{
  const handle = await cbaList.getRowHandle(id);
  return handle.evaluate((cbaListRow) => {
    const event = new DragEvent("dragstart", {
      bubbles: true,
      dataTransfer: new DataTransfer()
    });
    cbaListRow.dispatchEvent(event);

    return event.dataTransfer.getData("text/plain");
  });
}

function wait(milliseconds = 200)
{
  return page().waitFor(milliseconds);
}

module.exports = {pageSetup};
