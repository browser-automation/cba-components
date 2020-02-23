const {page} = require("../main");

const cbaListMethods = ["addRow", "updateRow", "deleteRow", "getItem",
  "getIndex", "getParentItem", "getSelectedItem", "selectRow", "_findItem",
  "setExpansion", "selectPreviousRow", "selectNextRow"];

class CbaList
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
    return handle.evaluateHandle((cbaList) => cbaList.shadowRoot);
  }
  async _executeMethod()
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaList, methodName, ...args) => cbaList[methodName](...args), ...arguments)
  }
  async setItems(items)
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaList, items) => cbaList.items = items, items);
  }
  async getItems()
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaList) => cbaList.items);
  }
  async getDomItem(id)
  {
    const rootHandle = await this._getShadowRoot();
    return rootHandle.$(`ul [data-id="${id}"]`);
  }
  async clickItem(id)
  {
    const rootHandle = await this._getShadowRoot();
    return rootHandle.evaluate((root, id) => root.querySelector(`ul [data-id="${id}"] .row`).click(), id);
  }
  async clickExpansion(id)
  {
    const rootHandle = await this._getShadowRoot();
    return rootHandle.evaluate((root, id) => root.querySelector(`ul [data-id="${id}"] button`).click(), id);
  }
  async getDomRowText(id)
  {
    const itemHandle = await this.getDomItem(id);
    if (!itemHandle)
      return false;
    const rowHandle = await itemHandle.$(`.row`);
    if (rowHandle)
      return await (await rowHandle.getProperty("textContent")).jsonValue();
    return false;
  }
  async getHighlightedLabel()
  {
    const rootHandle = await this._getShadowRoot();
    return rootHandle.evaluate((root) => root.querySelector(".highlight").textContent);
  }
  async isItemExpanded(id)
  {
    const item = await this.getItem(id);
    return item.expanded === true;
  }
};

cbaListMethods.forEach((methodName) => {
  CbaList.prototype[methodName] = async function() {
    return await this._executeMethod(methodName, ...arguments)
  };
});

module.exports = {CbaList};
