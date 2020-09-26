const {page} = require("../main");

const cbaTooltipMethods = ["setData", "disable", "enable", "isDisabled"];

class CbaTooltip
{
  constructor(selector)
  {
    this._selector = selector;
  }
  async _getHandle()
  {
    return page().$(this._selector);
  }
  async _getShadowRoot()
  {
    const handle = await this._getHandle();
    return handle.evaluateHandle((cbaTooltip) => cbaTooltip.shadowRoot);
  }
  async _getTooltipHandle()
  {
    const rootHandle = await this._getShadowRoot();
    return rootHandle.$("#tooltip");
  }
  async _getAttribute(handle, attribute)
  {
    return handle.evaluate((node, attribute) => node.getAttribute(attribute), attribute)
  }
  async _getTooltipTextContent(query)
  {
    const tooltipHandle = await this._getTooltipHandle();
    const handle = await tooltipHandle.$(query);
    return await (await handle.getProperty("textContent")).jsonValue();
  }
  async _executeMethod()
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaTooltip, methodName, ...args) => cbaTooltip[methodName](...args), ...arguments)
  }
  async getTooltipDirection()
  {
    const handle = await this._getTooltipHandle();
    return this._getAttribute(handle, "data-tooltip");
  }
  async getTooltipDataArrow()
  {
    const handle = await this._getTooltipHandle();
    return this._getAttribute(handle, "data-arrow");
  }
  async getHeadingContent()
  {
    return this._getTooltipTextContent("h4");
  }
  async getParagraphContent()
  {
    return this._getTooltipTextContent("p");
  }
  async getLinkContent()
  {
    return this._getTooltipTextContent("a");
  }
  async getActionContent()
  {
    return this._getTooltipTextContent("a:nth-of-type(2)");
  }
  async getLink()
  {
    const tooltipHandle = await this._getTooltipHandle();
    const handle = await tooltipHandle.$("a");
    return this._getAttribute(handle, "href");
  }
  async clickAction()
  {
    const tooltipHandle = await this._getTooltipHandle();
    const handle = await tooltipHandle.$("a:nth-of-type(2)");
    return handle.click();
  }
};

cbaTooltipMethods.forEach((methodName) => {
  CbaTooltip.prototype[methodName] = async function() {
    return await this._executeMethod(methodName, ...arguments);
  };
});

module.exports = {CbaTooltip};
