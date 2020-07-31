const {page} = require("../main");

const cbaListMethods = ["addRow", "updateRow", "deleteRow", "getItem",
  "getIndex", "getParentItem", "getSelectedItem", "selectRow", "_findItem",
  "setExpansion", "selectPreviousRow", "selectNextRow", "setEditable",
  "saveEditables"];

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
  async _getHandleTextContent(handle)
  {
    return await (await handle.getProperty("textContent")).jsonValue();
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
  async getHeadingText()
  {
    const rootHandle = await this._getShadowRoot();
    return this._getHandleTextContent(await rootHandle.$("h2"));
  }
  async getSubHeadingText()
  {
    const rootHandle = await this._getShadowRoot();
    return this._getHandleTextContent(await rootHandle.$("h3 a"));
  }
  async getItems()
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaList) => cbaList.items);
  }
  async getRowHandle(id)
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
  async _getLabelByHandle(itemHandle)
  {
    const rowHandle = await itemHandle.$(`.row`);
    if (rowHandle)
      return this._getHandleTextContent(rowHandle);
    return false;
  }
  async getDomRowText(id)
  {
    const itemHandle = await this.getRowHandle(id);
    if (itemHandle)
      return this._getLabelByHandle(itemHandle);
    else
      return false;
  }
  async getDomRowIndexText(index)
  {
    const rootHandle = await this._getShadowRoot();
    const id = await rootHandle.evaluate((root, index) => root.querySelectorAll("ul li")[index].dataset.id, index);
    return this.getDomRowText(id);
  }
  async isDomRowEditable(id)
  {
    const itemHandle = await this.getRowHandle(id);
    return itemHandle.evaluate((row) => row.querySelector(".row").getAttribute("contenteditable"))
  }
  async setSort(sort)
  {
    return (await this._getHandle()).evaluate((cbaList, sort) => cbaList.setAttribute("sort", sort), sort);
  }
  async getId()
  {
    return (await (await this._getHandle()).getProperty("id")).jsonValue();
  }
  async getHighlightedLabel()
  {
    const rootHandle = await this._getShadowRoot();
    return this._getHandleTextContent(await rootHandle.$(".highlight"));
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
