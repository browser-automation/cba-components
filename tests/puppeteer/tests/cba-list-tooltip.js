const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-list heading="Heading text" subHeading="Subheading text" tooltip-text="tooltip.text" tooltip-link="tooltip.link"></cba-list>`,
  js: ["cba-list/cba-list.js", "cba-tooltip/cba-tooltip.js"]
}

const {CbaList} = require("../classes/CbaList");
const cbaList = new CbaList("cba-list");

beforeEach(async () =>
{
  await cbaList.setItems([]);
});

it("cba-list rows with matching data of tooltip-text and tooltip-link attribute queries add cba-tooltip with matched text and link", async() =>
{
  const tooltipRowId = "tooltip-item";
  const noTooltipRowId = "no-tooltip-item";
  const tooltipText = "Tooltip text";
  const tooltipLink = "https://example.com";
  const items = [
    {
      id: noTooltipRowId,
      data: "Info",
      text: "List1"
    },
    {
      id: tooltipRowId,
      data: "Info",
      text: "List3",
      tooltip: {
        text: tooltipText,
        link: tooltipLink
      }
    },
  ];

  await cbaList.setItems(items);
  ok(await cbaList.hasRowTooltip(tooltipRowId));
  equal(await cbaList.getTooltipHeadingText(tooltipRowId), tooltipText);
  equal(await cbaList.getTooltipLink(tooltipRowId), tooltipLink);
  equal(await cbaList.getTooltipAttribute(tooltipRowId, "text"), tooltipText);
  equal(await cbaList.getTooltipAttribute(tooltipRowId, "link"), tooltipLink);

  notOk(await cbaList.hasRowTooltip(noTooltipRowId));
});

function wait(milliseconds = 200)
{
  page().waitFor(milliseconds);
}

module.exports = {pageSetup};
