const assert = require("assert");
const equal = assert.strictEqual;
const deepEqual = assert.deepStrictEqual;
const notDeepEqual = assert.notDeepStrictEqual;
const ok = assert.ok;
const notOk = (value) => ok(!value);

// page is only accessible in it() functions, as those are called after before()
const {page} = require("../main");

const pageSetup = {
  body: `<cba-tooltip><button>Hover</button></cba-tooltip>`,
  js: ["cba-tooltip/cba-tooltip.js"]
}

const {CbaTooltip} = require("../classes/CbaTooltip");
const cbaTooltip = new CbaTooltip("cba-tooltip");

beforeEach(async () =>
{
  await setPageBody(pageSetup.body);
});

it("Tooltip opening direction is calculated automatically depending on the item position", async() =>
{
  await moveTooltip("top", "right");
  await wait(30);
  await hoverTooltip();
  await wait(30);
  equal(await cbaTooltip.getTooltipDirection(), "left-bottom");

  await moveTooltip("top", "left");
  await wait(30);
  await hoverTooltip();
  await wait(30);
  equal(await cbaTooltip.getTooltipDirection(), "right-bottom");

  await moveTooltip("bottom", "left");
  await wait(30);
  await hoverTooltip();
  await wait(30);
  equal(await cbaTooltip.getTooltipDirection(), "right-top");

  await moveTooltip("bottom", "right");
  await wait(30);
  await hoverTooltip();
  await wait(30);
  equal(await cbaTooltip.getTooltipDirection(), "left-top");
});

it("heading, text, link, link-text attributes populate the tooltip accoridngly", async() =>
{
  const heading = "Test Heading";
  const text = "Test text";
  const link = "http://example.com";
  const linkText = "Text link text";
  const attributesObj = {heading, text, link, "link-text": linkText};

  let attributes = "";
  for (const attribute in attributesObj) {
    attributes += ` ${attribute}="${attributesObj[attribute]}"`;
  }

  const tooltip = `<cba-tooltip ${attributes}><button>Hover</button></cba-tooltip>`;
  await setPageBody(tooltip);

  equal(heading, await cbaTooltip.getHeadingContent());
  equal(text, await cbaTooltip.getParagraphContent());
  equal(linkText, await cbaTooltip.getLinkContent());
  equal(link, await cbaTooltip.getLink());
});

it("Passing object with heading, text, link, linkText, action, actionText properties to setData populate the tooltip accoridngly", async() =>
{
  const heading = "Test Heading";
  const text = "Test text";
  const link = "http://example.com";
  const linkText = "Text link text";
  const actionText = "Add class";
  const handle = await cbaTooltip._getHandle();
  await handle.evaluate((tooltip, heading, text, link, linkText, actionText) => 
  {
    const action = () => document.body.classList.add("action");
    tooltip.setData({heading, text, link, linkText, action, actionText});
  }, heading, text, link, linkText, actionText);
  await hoverTooltip();
  equal(heading, await cbaTooltip.getHeadingContent());
  equal(text, await cbaTooltip.getParagraphContent());
  equal(linkText, await cbaTooltip.getLinkContent());
  equal(link, await cbaTooltip.getLink());
  equal(actionText, await cbaTooltip.getActionContent());
  await cbaTooltip.clickAction();
  ok(await page().evaluate(() => document.body.classList.contains("action")));
});

it("arrow attribute with 'x' and 'y' values updates tooltip data-arrow attribute accordingly", async() =>
{
  equal(await cbaTooltip.getTooltipDataArrow(), "x");
  const tooltipY = `<cba-tooltip arrow="y"><button>Hover</button></cba-tooltip>`;
  await setPageBody(tooltipY);
  equal(await cbaTooltip.getTooltipDataArrow(), "y");
});

async function moveTooltip(vertical, horizontal) {
  const handle = await cbaTooltip._getHandle();
  return handle.evaluate((tooltip, vertical, horizontal) => 
  {
    tooltip.style.position = "absolute";
    tooltip.style.top = "auto";
    tooltip.style.left = "auto";
    tooltip.style.right = "auto";
    tooltip.style.bottom = "auto";
    if (vertical === "bottom")
      tooltip.style.bottom = "0";
    else
      tooltip.style.top = "0";
    if (horizontal === "right")
      tooltip.style.right = "0";
    else
      tooltip.style.left = "0";
  }, vertical, horizontal);
}

async function setPageBody(body) {
  return page().evaluate((bodyHTML) => document.body.innerHTML = bodyHTML, body);
}

async function hoverTooltip() {
  const handle = await cbaTooltip._getHandle();
  return handle.hover();
}

function wait(milliseconds = 200)
{
  return page().waitForTimeout(milliseconds);
}

module.exports = {pageSetup};
