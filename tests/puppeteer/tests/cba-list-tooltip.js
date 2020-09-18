const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-list heading="Heading text" subHeading="Subheading text" tooltip-text="tooltip.text" tooltip-link="tooltip.link" tooltip-link-text="tooltip.linkText"></cba-list>`,
  js: ["cba-list/cba-list.js"]
}

const {CbaList} = require("../classes/CbaList");
const cbaList = new CbaList("cba-list");

beforeEach(async () =>
{
  await cbaList.setItems([]);
});

it("cba-list rows with matching data of tooltip-text and tooltip-link attribute queries add info icon which shows tooltip with matched text and link on hover", async() =>
{
  const tooltipRowId = "tooltip-item";
  const tooltipNoLinkTextRowId = "tooltip-no-link-text";
  const noTooltipRowId = "no-tooltip-item";
  const tooltipText = "Tooltip text";
  const tooltipLink = "https://example.com";
  const tooltipLinkText = "Learn even more";
  const tooltipLinkTextDefault = "Learn more";
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
        link: tooltipLink,
        linkText: tooltipLinkText
      }
    },
    {
      id: tooltipNoLinkTextRowId,
      data: "Info",
      text: "List4",
      tooltip: {
        text: tooltipText,
        link: tooltipLink
      }
    },
  ];

  await cbaList.setItems(items);
  ok(await cbaList.hasRowTooltip(tooltipRowId));
  notOk(await cbaList.hasRowTooltip(noTooltipRowId));

  await cbaList.hoverRowInfo(tooltipRowId);
  equal(await cbaList.getTooltipHeadingText(), tooltipText);
  equal(await cbaList.getTooltipLink(tooltipRowId), tooltipLink);
  equal(await cbaList.getTooltipLinkText(tooltipRowId), tooltipLinkText);

  await cbaList.hoverRowInfo(tooltipNoLinkTextRowId);
  equal(await cbaList.getTooltipLink(tooltipRowId), tooltipLink);
  equal(await cbaList.getTooltipLinkText(tooltipRowId), tooltipLinkTextDefault);
  equal(await cbaList.getTooltipAttribute("class"), "visible");

  await cbaList.hoverRow(tooltipRowId);
  equal(await cbaList.getTooltipAttribute("class"), "");
});

function wait(milliseconds = 200)
{
  page().waitFor(milliseconds);
}

module.exports = {pageSetup};
