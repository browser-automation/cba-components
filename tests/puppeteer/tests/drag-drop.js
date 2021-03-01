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

it("Reordering to top of the element drop item above and trigger's 'dragndrop' event with info", async function()
{
  const cbaTableItems = await populateCbaTable();
  const rowHandle1 = await cbaTable.getRowHandle(cbaTableItems[0].id);
  const data = await triggerDragStart(rowHandle1);
  equal(data, `${cbaTableItems[0].id}#`);
  await wait(30);
  ok(await isCbaTableRowHidden(cbaTableItems[0].id));

  await cbaTable.hoverRow(cbaTableItems[2].id);
  await cbaTable.triggerRowEvent(cbaTableItems[2].id, "dragenter");
  await cbaTable.triggerDragOverRow(cbaTableItems[2].id, 5);
  await cbaTable.triggerRowEvent(cbaTableItems[0].id, "dragleave");
  const {dropRowId, dragRowId, reordered, dropAfter} = await triggerDrop(cbaTableItems[2].id, data);
  await cbaTable._triggerEvent(rowHandle1, "dragend");

  notOk(await isCbaTableRowHidden(cbaTableItems[0].id));
  equal(dragRowId, cbaTableItems[0].id);
  equal(dropRowId, cbaTableItems[2].id);
  ok(reordered);
  notOk(dropAfter);

  await itemIsRenderedOnRowIndex(cbaTableItems[1], 0);
  await itemIsRenderedOnRowIndex(cbaTableItems[0], 1);
  await itemIsRenderedOnRowIndex(cbaTableItems[2], 2);
});

it("Reordering to bottom of the element drop item below and trigger's 'dragndrop' event with info", async function()
{
  const cbaTableItems = await populateCbaTable();
  const rowHandle1 = await cbaTable.getRowHandle(cbaTableItems[0].id);
  const data = await triggerDragStart(rowHandle1);
  equal(data, `${cbaTableItems[0].id}#`);
  await wait(30);
  ok(await isCbaTableRowHidden(cbaTableItems[0].id));

  await cbaTable.hoverRow(cbaTableItems[2].id);
  await cbaTable.triggerRowEvent(cbaTableItems[2].id, "dragenter");
  await cbaTable.triggerDragOverRow(cbaTableItems[2].id, 30);
  await cbaTable.triggerRowEvent(cbaTableItems[0].id, "dragleave");
  const {dropRowId, dragRowId, reordered, dropAfter} = await triggerDrop(cbaTableItems[2].id, data);
  await cbaTable._triggerEvent(rowHandle1, "dragend");

  notOk(await isCbaTableRowHidden(cbaTableItems[0].id));
  equal(dragRowId, cbaTableItems[0].id);
  equal(dropRowId, cbaTableItems[2].id);
  ok(reordered);
  ok(dropAfter);

  await itemIsRenderedOnRowIndex(cbaTableItems[1], 0);
  await itemIsRenderedOnRowIndex(cbaTableItems[2], 1);
  await itemIsRenderedOnRowIndex(cbaTableItems[0], 2);
});

it("Dragging cba-list item and dropping to cba-table row top adds item above and trigger's 'dragndrop' event with info", async function()
{
  const cbaListItems = await populateCbaList();
  const cbaTableItems = await populateCbaTable();
  const cbaListId = await cbaList.getId();
  const data = await triggerDragStart(await cbaList.getRowHandle(cbaListItems[0].id));
  equal(data, `${cbaTableItems[0].id}#${cbaListId}`);

  await cbaTable.triggerDragOverRow(cbaTableItems[1].id, 5);
  const {dropRowId, dragRowId, dragId, reordered, dropAfter} = await triggerDrop(cbaTableItems[1].id, data);
  equal(dragRowId, cbaListItems[0].id);
  equal(dropRowId, cbaTableItems[1].id);
  equal(dragId, cbaListId);
  notOk(reordered);
  notOk(dropAfter);

  await itemIsRenderedOnRowIndex(cbaListItems[0].data, 1);
});

it("Dragging cba-list item and dropping to cba-table row bottom adds item below and trigger's 'dragndrop' event with info", async function()
{
  const cbaListItems = await populateCbaList();
  const cbaTableItems = await populateCbaTable();
  const cbaListId = await cbaList.getId();
  const listRowHandle = await cbaList.getRowHandle(cbaListItems[0].id);
  const data = await triggerDragStart(listRowHandle);
  equal(data, `${cbaTableItems[0].id}#${cbaListId}`);

  await cbaTable.hoverRow(cbaTableItems[2].id);
  await cbaTable.triggerRowEvent(cbaTableItems[2].id, "dragenter");
  await cbaTable.triggerDragOverRow(cbaTableItems[2].id, 30);
  const {dropRowId, dragRowId, dragId, reordered, dropAfter} = await triggerDrop(cbaTableItems[2].id, data);
  await cbaTable._triggerEvent(listRowHandle, "dragend");
  equal(dragRowId, cbaListItems[0].id);
  equal(dropRowId, cbaTableItems[2].id);
  equal(dragId, cbaListId);
  notOk(reordered);
  ok(dropAfter);

  await itemIsRenderedOnRowIndex(cbaListItems[0].data, 3);
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
  for (let index = 1; index <= 5; index++) {
    const item = {
      id: `row${index}`,
      data: "Info",
      texts: {
        data: `Data${index}`,
        event: `Event${index}`,
        value: `Value${index}`
      }
    };
    if (index == 5)
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

async function isCbaTableRowHidden(id)
{
  const handle = await cbaTable.getRowHandle(id);
  return handle.evaluate((cbaTableRow) => {
    return window.getComputedStyle(cbaTableRow).getPropertyValue("display") === "none";
  });
}

function wait(milliseconds = 200)
{
  return page().waitForTimeout(milliseconds);
}

module.exports = {pageSetup};
