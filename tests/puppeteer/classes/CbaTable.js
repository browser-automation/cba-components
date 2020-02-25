const {page} = require("../main");

const cbaTableMethods = ["addRow", "updateRow", "deleteRow", "getItem",
                         "selectRow", "selectNextRow", "selectPreviousRow"];

class CbaTable
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
    return handle.evaluateHandle((cbaTable) => cbaTable.shadowRoot);
  }
  async _getTbody()
  {
    const root = await this._getShadowRoot();
    return root.$("tbody");
  }
  async _getThead()
  {
    const root = await this._getShadowRoot();
    return root.$("thead");
  }
  async _executeMethod()
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaTable, methodName, ...args) => cbaTable[methodName](...args), ...arguments)
  }
  async getRowHandle(id)
  {
    const tbody = await this._getTbody();
    return tbody.$(`tr[data-id="${id}"]`);
  }
  async clickItem(id)
  {
    const tbodyHandle = await this._getTbody();
    return tbodyHandle.evaluate((tbody, id) => tbody.querySelector(`tr[data-id="${id}"]`).click(), id);
  }
  async setItems(items)
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaTable, items) => cbaTable.items = items, items);
  }
  async getItems()
  {
    const handle = await this._getHandle();
    return handle.evaluate((cbaTable) => cbaTable.items);
  }
  async getHighlightedTexts()
  {
    const tbody = await this._getTbody();
    return this._getRowtexts(await tbody.$(".highlight"));
  }
  async _getRowtexts(rowHandle)
  {
    if (!rowHandle)
      return false;

    return rowHandle.evaluate((row) => 
    {
      const cells = row.querySelectorAll("td");
      if (!cells.length)
        return false;
      return [...cells].reduce((acc, cell) => {
        acc[cell.dataset.id] = cell.textContent;
        return acc;
      }, {});
    }, rowHandle);
  }
  async getDomRowTexts(id)
  {
    const tbody = await this._getTbody();
    return this._getRowtexts(await tbody.$(`tr[data-id="${id}"]`));
  }
  async getDomRowIndexText(index)
  {
    const rootHandle = await this._getTbody();
    const id = await rootHandle.evaluate((root, index) => root.querySelectorAll("tr")[index].dataset.id, index);
    return this.getDomRowTexts(id);
  }
  async isItemExpanded(id)
  {
    const item = await this.getItem(id);
    return item.expanded === true;
  }
};

cbaTableMethods.forEach((methodName) => {
  CbaTable.prototype[methodName] = async function() {
    return await this._executeMethod(methodName, ...arguments)
  };
});

module.exports = {CbaTable};
