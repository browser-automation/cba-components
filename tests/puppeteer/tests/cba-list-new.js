const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-list-new heading="Heading text" subHeading="Subheading text"></cba-new-list>`,
  js: ["cba-list-new/cba-list-new.js"]
}

const {CbaList} = require("../classes/CbaListNew");
const cbaList = new CbaList("cba-list-new");

beforeEach(async () =>
{
  await cbaList.setItems([]);
});

it("heading and subHeading attributes should specify headings accordingly", async() =>
{
  equal(await cbaList.getHeadingText(), "Heading text");
  equal(await cbaList.getSubHeadingText(), "Subheading text");
});

it(".list property populates, gets items and render cba-list with row items and subItems", async() =>
{
  const items = await prepopulatedItems();
  const populatedItems = await cbaList.getItems();
  deepEqual(populatedItems[0], items[0]);
  deepEqual(populatedItems[1].subItems[0], items[1].subItems[0]);
  notDeepEqual(populatedItems[1], items[1], "Sets missing ID");
  notDeepEqual(populatedItems[2], items[2], "Sets missing ID");
  equal(await cbaList.getDomRowText("row1"), items[0].text);
  equal(await cbaList.getDomRowText("row2"), items[1].text);
  notOk(await cbaList.getDomRowText("subrow1"));
});

it("addRow method ads new row or sub-row item", async() =>
{
  await cbaList.addRow({
    data: "Info",
    text: "List4",
    id: "addedRow1"
  });
  equal(await cbaList.getDomRowText("addedRow1"), "List4");
});

it("updateRow should update a specific row record", async() =>
{
  const rowId = "rowToUpate";
  const oldText = "initial";
  const newText = "new Text";
  await cbaList.addRow({
    data: "Info",
    text: oldText,
    id: rowId
  });
  equal(await cbaList.getDomRowText(rowId), oldText);
  await cbaList.updateRow({
    data: "Info",
    text: newText
  }, rowId);
  equal(await cbaList.getDomRowText(rowId), newText);
});

it("getItem should get a specific row record", async() =>
{
  const items = await prepopulatedItems();
  deepEqual(await cbaList.getItem(items[0].id), items[0]);
  deepEqual(await cbaList.getItem(items[1].subItems[0].id), items[1].subItems[0]);
});

it("getIndex should get index and parentIndex for a row item", async() =>
{
  const items = await prepopulatedItems();

  deepEqual(await cbaList.getIndex(items[0].id), [0, -1]);
  deepEqual(await cbaList.getIndex(items[1].id), [1, -1]);
  deepEqual(await cbaList.getIndex(items[1].subItems[0].id), [0, 1]);
});

it("deleteRow should delete specific row", async() =>
{
  const items = await prepopulatedItems();
  await cbaList.deleteRow(items[0].id);
  equal(await cbaList.getItem(items[0].id), false);
  equal(await cbaList.getDomRowText(items[0].id), false);
  await cbaList.deleteRow(items[1].subItems[0].id);
  equal(await cbaList.getItem(items[1].subItems[0].id), false);
  equal(await cbaList.getDomRowText(items[1].subItems[0].id), false);
});

it("setEditable should make row editable, saveEditables save changes", async() =>
{
  const items = await prepopulatedItems();
  await cbaList.setEditable(items[0].id, true);
  equal(await cbaList.isDomRowEditable(items[0].id), "true");
  const prefix = "Prefix";
  const postfix = "Postfix";
  await page().keyboard.type(prefix);
  await page().keyboard.press("ArrowDown");
  await page().keyboard.type(postfix);
  await cbaList.saveEditables();
  const item = await cbaList.getItem(items[0].id);
  equal(item.text, `${prefix}${items[0].text}${postfix}`);
});

it("getParentItem should get parent item", async() =>
{
  const items = await prepopulatedItems();
  equal(await cbaList.getParentItem(items[0].id), false);
  equal(await cbaList.getParentItem(items[1].id), false);
  equal((await cbaList.getParentItem(items[1].subItems[0].id)).id, items[1].id);
});

it("setExpansion should expand and collapse the row", async() =>
{
  const items = await prepopulatedItems();
  equal(await cbaList.isItemExpanded(items[1].id), false);
  await cbaList.setExpansion(items[1].id, true);
  equal(await cbaList.isItemExpanded(items[1].id), true);
  equal(await cbaList.getDomRowText(items[1].subItems[0].id), items[1].subItems[0].text);
  await cbaList.setExpansion(items[1].id, false);
  equal(await cbaList.isItemExpanded(items[1].id), false);
  equal(await cbaList.getDomRowText(items[1].subItems[0].id), false);
});

it("Clicking Expansion button expands subitems", async() =>
{
  const items = await prepopulatedItems();
  equal(await cbaList.isItemExpanded(items[1].id), false);
  await cbaList.clickExpansion(items[1].id);
  equal(await cbaList.isItemExpanded(items[1].id), true);
  await cbaList.clickExpansion(items[1].id);
  equal(await cbaList.isItemExpanded(items[1].id), false);
});

it("selectRow should Highlight a specific item ", async() =>
{
  const items = await prepopulatedItems(true);
  await cbaList.selectRow(items[0].id);
  equal(await cbaList.getHighlightedLabel(), items[0].text);
  equal((await cbaList.getItem(items[0].id)).selected, true);
  await cbaList.selectRow(items[1].subItems[0].id);
  equal(await cbaList.getHighlightedLabel(), items[1].subItems[0].text);
  equal((await cbaList.getItem(items[1].subItems[0].id)).selected, true);
});

it("selectNextRow and selectPreviousRow should switch highlighting accordingly", async() =>
{
  const items = await prepopulatedItems(true);
  await cbaList.selectRow(items[0].id);
  equal(await cbaList.getHighlightedLabel(), items[0].text);
  await cbaList.selectNextRow();
  equal(await cbaList.getHighlightedLabel(), items[1].text);
  await cbaList.selectNextRow();
  equal(await cbaList.getHighlightedLabel(), items[1].subItems[0].text);
  await cbaList.selectNextRow();
  equal(await cbaList.getHighlightedLabel(), items[1].subItems[1].text);
  await cbaList.selectNextRow();
  equal(await cbaList.getHighlightedLabel(), items[2].text);
  await cbaList.selectNextRow();
  equal(await cbaList.getHighlightedLabel(), items[0].text);
  await cbaList.selectPreviousRow();
  equal(await cbaList.getHighlightedLabel(), items[2].text);
  await cbaList.selectPreviousRow();
  equal(await cbaList.getHighlightedLabel(), items[1].subItems[1].text);
  await cbaList.selectPreviousRow();
  equal(await cbaList.getHighlightedLabel(), items[1].subItems[0].text);
  await cbaList.selectPreviousRow();
  equal(await cbaList.getHighlightedLabel(), items[1].text);
  await cbaList.selectPreviousRow();
  equal(await cbaList.getHighlightedLabel(), items[0].text);
});

it("Keyboard navigation should switch and expand/collaps rows accordingly", async() =>
{
  const items = await prepopulatedItems();
  await cbaList.clickItem(items[0].id);
  equal(await cbaList.getHighlightedLabel(), items[0].text);
  page().keyboard.press("ArrowDown");
  equal(await cbaList.getHighlightedLabel(), items[1].text);
  equal(await cbaList.isItemExpanded(items[1].id), false);
  page().keyboard.press("ArrowRight");
  equal(await cbaList.isItemExpanded(items[1].id), true);
  page().keyboard.press("ArrowDown");
  equal(await cbaList.getHighlightedLabel(), items[1].subItems[0].text);
  page().keyboard.press("ArrowLeft");
  equal(await cbaList.getHighlightedLabel(), items[1].text);
  page().keyboard.press("ArrowUp");
  equal(await cbaList.getHighlightedLabel(), items[0].text);
});

async function prepopulatedItems(expanded)
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
      data: "Info",
      text: "List3"
    },
  ];
  if (expanded)
    items[1].expanded = true;
  await cbaList.setItems(items);
  return items;
}

function wait(milliseconds = 200)
{
  page().waitFor(milliseconds);
}

module.exports = {pageSetup};
