const {page} = require("../main");
const {Common} = require("./Common");

const cbaTableMethods = ["addRow", "updateRow", "deleteRow", "getItem",
                         "selectRow", "selectNextRow", "selectPreviousRow"];

class CbaTable extends Common
{
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
        acc.push(cell.textContent);
        return acc;
      }, []);
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
  async triggerRowEvent(id, event, data)
  {
    const handle = await this.getRowHandle(id);
    return this._triggerEvent(handle, event, data);
  }
  async getRowBoundingClientRect(id)
  {
    const handle = await this.getRowHandle(id);
    return handle.evaluate((cbaTableRow) => {
      const {top, left, bottom, right} = cbaTableRow.getBoundingClientRect();
      return {top, left, bottom, right};
    });
  }
  async triggerDragOverRow(id, offset)
  {
    const handle = await this.getRowHandle(id);
    const {top} = await this.getRowBoundingClientRect(id);
    return this._triggerEvent(handle, "dragover", {clientY: top + offset});
  }
  async dispatchExpectRowEvent(rowId, dispatch, expect)
  {
    const rowHandle = await this.getRowHandle(rowId);
    const cbaTableHandle = await this._getHandle();
    return cbaTableHandle.evaluate((cbaTable, row, dispatch, expect) => {
      return new Promise((resolve) => {
        cbaTable.addEventListener(expect, ({detail}) =>
        {
          return resolve(detail);
        });
        const mouseoverEvent = new MouseEvent(dispatch, {bubbles: true});
        row.dispatchEvent(mouseoverEvent);
      });
    }, rowHandle, dispatch, expect);
  }
  async hoverRow(id)
  {
    const handle = await this.getRowHandle(id);
    return handle.hover();
  }
};

cbaTableMethods.forEach((methodName) => {
  CbaTable.prototype[methodName] = async function() {
    return await this._executeMethod(methodName, ...arguments)
  };
});

module.exports = {CbaTable};
