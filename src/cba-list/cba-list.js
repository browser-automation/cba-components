import {html, render} from 'lit-html';
import shadowCSS from './shadow.css';

class List extends HTMLElement {
  constructor() {
    super();
    this.container = null;
    this.subHeading = null;
    this.idCount = 0;
    this.draggable = false;
    this.sort = false;
    this.connected = false;
    this.hasSubtiems = false;
    this._data = [
    ];

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <style>
      ${shadowCSS}
    </style>
    <div>
      <h2>Heading</h2>
      <h3 id="column"><a href="#">Column</a></h3>
      <ul>
        <li><span class="row">List1</span></li>
        <li class="highlight"><span class="row">List2</span>
          <ul><li><span class="row">List2-2</span></li></ul>
        </li>
      </ul>
    </div>
    `;
  }

  /**
   * Populate and render items ensuring the ids and sorting
   * @param {array} rowItems Items, item contains of: {id, data, text}
   */
  set items(rowItems)
  {
    this.hasSubtiems = false;
    const setId = (rowItem) =>
    {
      if (!rowItem.id)
        rowItem.id = `cba-list-id-${++ this.idCount}`;
      if (rowItem.subItems)
      {
        this.hasSubtiems = true;
        rowItem.subItems = rowItem.subItems.map(setId);
        return rowItem;
      }
      else
        return rowItem;
    }
    this._data = rowItems.map(setId);
    if (this.sort)
      this._sortItems();
    this._render();
  }

  /**
   * Get Items
   * @return {array}
   */
  get items()
  {
    return JSON.parse(JSON.stringify(this._data));
  }

  static get observedAttributes() {
    return ["sort"];
  }

  /**
   * Called each time an attribute on the custom element is changed
   * @param {String} name attribute name
   * @param {String} oldValue Old value of the attribute
   * @param {String} newValue New value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue)
  {
    if (oldValue === newValue || !this.connected)
    {
      return;
    }
    if (name === "sort")
    {
      this.sort = this.getAttribute("sort");
      this._sortItems();
      this._render();
    }
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this.container = this.shadowRoot.querySelector("ul");
    this.subHeading = this.shadowRoot.querySelector("#column");
    this.draggable = this.getAttribute("draggable") == true;
    this.sort = this.getAttribute("sort");
    this.connected = true;

    this.container.addEventListener("click", ({target}) => 
    {
      if (target.tagName === "BUTTON")
      {
        const item = this.getItem(target.parentElement.dataset.id);
        this.setExpansion(item.id, !item.expanded);
        return;
      }
      const row = target.closest(".row");
      if (row)
      {
        this.selectRow(row.parentElement.dataset.id);
      }
    });

    if (this.draggable)
    {
      this.container.addEventListener("dragstart", (e) =>
      {
        const rowId = e.target.closest("[data-id]").dataset.id;
        e.dataTransfer.setData("text/plain", `${rowId}#${this.id}`);
      });
    }

    this.container.addEventListener("keydown", (e) =>
    {
      if (e.key === "ArrowDown")
      {
        e.preventDefault();
        this.selectNextRow();
      }
      if (e.key === "ArrowUp")
      {
        e.preventDefault();
        this.selectPreviousRow();
      }
      if (e.key === "ArrowRight")
      {
        e.preventDefault();
        this.setExpansion(this.getSelectedItem().id, true);
      }
      if (e.key === "ArrowLeft")
      {
        e.preventDefault();
        const selectedId = this.getSelectedItem().id;
        const parentItem = this.getParentItem(selectedId);
        if (parentItem)
        {
          this.selectRow(parentItem.id);
          this.setExpansion(parentItem.id, false);
        }
        else
          this.setExpansion(selectedId, false);
      }
    });

    if (this.sort)
    {
      this.subHeading.addEventListener("click", (e) =>
      {
        e.preventDefault();
        if (this.sort == "desc")
          this.setAttribute("sort", "asc");
        else if (this.sort == "asc")
          this.setAttribute("sort", "desc");
        else
          this.setAttribute("sort", "asc");
      });
    }
    this._render();
  }

  _sortItems()
  {
    let sortMethod = null;
    if (this.sort == "asc")
    {
      sortMethod = (a, b) =>
      {
        return a.text.localeCompare(b.text, undefined, {numeric: true})
      }
    }
    if (this.sort == "desc")
    {
      sortMethod = (a, b) =>
      {
        return b.text.localeCompare(a.text, undefined, {numeric: true});
      }
    }
    if (sortMethod)
      this._data = this._data.sort(sortMethod);
    return this._data;
  }

  /**
   * Highlight and focuses a specific item
   * @param {string} rowId Id of if the row to focus
   */
  selectRow(rowId)
  {
    const updateSelected = (items) =>
    {
      for (const item of items)
      {
        if (item.selected)
          delete item.selected;
        if (item.id === rowId)
          item.selected = true;
        if (item.subItems)
          updateSelected(item.subItems);
      }
    };
    updateSelected(this._data);
    this._render();
    this._focusSelected();
    this.dispatchEvent(new CustomEvent("select"));
  }

  /**
   * Expand or collapse a specific row with subitems
   * @param {string} id Row ID
   * @param {boolean} state expansion state (true means expanded)
   */
  setExpansion(id, state)
  {
    this._findItem("id", id).expanded = state;
    this._render();
  }

  /**
   * Selects next row
   */
  selectNextRow()
  {
    const item = this.getSelectedItem();
    const [index, parentIndex] = this.getIndex(item.id);
    if (parentIndex >= 0)
    {
      const items = this._data[parentIndex].subItems;
      const itemToSelect = items[index + 1] ||
                           this._data[parentIndex + 1] ||
                           this._data[0];
      this.selectRow(itemToSelect.id);
    }
    else
    {
      let itemToSelect = this._data[index + 1] || this._data[0];
      if (item.subItems && item.expanded)
        itemToSelect = item.subItems[0];
      this.selectRow(itemToSelect.id);
    }
  }

  /**
   * Selects previous row
   */
  selectPreviousRow()
  {
    const item = this.getSelectedItem();
    const [index, parentIndex] = this.getIndex(item.id);
    if (parentIndex >= 0)
    {
      const items = this._data[parentIndex].subItems;
      const itemToSelect = items[index - 1] ||
                           this._data[parentIndex] ||
                           this._data[this._data.length - 1];
      this.selectRow(itemToSelect.id);
    }
    else
    {
      const previousItem = this._data[index - 1];
      let itemToSelect = this._data[index - 1] || this._data[this._data.length - 1];
      if (previousItem && previousItem.subItems && previousItem.expanded)
        itemToSelect = previousItem.subItems[previousItem.subItems.length - 1];
      this.selectRow(itemToSelect.id);
    }
  }

  _findItem(property, value, parent)
  {
    const search = (items, parentItem) =>
    {
      for (const item of items)
      {
        if (item[property] && item[property] === value)
        {
          if (parent)
          {
            if (parentItem)
              return parentItem;
            else
              return false;
          }
          else
            return item
        }
        if (item.subItems)
        {
          const found = search(item.subItems, item);
          if (found)
            return found;
        }
      }
      return false;
    };
    return search(this._data);
  }

  /**
   * Get a specific row record
   * @param {string} rowId Row id
   * @return {object}
   */
  getItem(rowId)
  {
    const item = this._findItem("id", rowId);
    return item ? JSON.parse(JSON.stringify(item)) : false;
  }

  /**
   * Get index and parentIndex for a row item.
   * @param {string} rowId ID of the row item
   * @return {array} [index, parentIndex]
   */
  getIndex(rowId)
  {
    const parent = this._findItem("id", rowId, true);
    const item = this._findItem("id", rowId);
    if (parent)
      return [parent.subItems.indexOf(item), this._data.indexOf(parent)];
    else
      return [this._data.indexOf(item), -1];
  }

  /**
   * Gets selected row record
   * @return {object}
   */
  getSelectedItem()
  {
    const item = this._findItem("selected", true);
    return item ? JSON.parse(JSON.stringify(item)) : false;
  }

  /**
   * Adds(pushes) a new row to the root or as a sub item
   * @param {object} data Row data
   * @param {string} parentOrSubId (optional) Id specifying parent item
   */
  addRow(data, parentOrSubId)
  {
    const items = this.items;
    const [index, parentIndex] = this.getIndex(parentOrSubId);
    if (parentOrSubId)
    {
      if (parentIndex != -1)
      {
        items[parentIndex].subItems.push(data);
      }
      else if (index != -1)
      {
        if (!items[index].subItems)
          items[index].subItems = [];
        items[index].subItems.push(data);
      }
      else
        return false;
    }
    else
      items.push(data);

    this.items = items;
  }

  /**
   * Updating a specific record in the list
   * @param {object} data new item data
   * @param {string} rowId Row id
   */
  updateRow(data, rowId)
  {
    const item = this._findItem("id", rowId);
    for (const key in data)
      item[key] = data[key];
    this._render();
  }

  /**
   * Deletes a specifid row
   * @param {string} rowId Row id
   */
  deleteRow(rowId)
  {
    const [index, parentIndex] = this.getIndex(rowId);
    if (index < 0)
      return;

    const {id} = this.getSelectedItem();
    if (id === rowId)
      this.selectPreviousRow();

    if (parentIndex >= 0)
      this._data[parentIndex].subItems.splice(index, 1);
    else
      this._data.splice(index, 1);
    this._render();
  }

  /**
   * Gets parent item if target has one
   * @param {string}  rowId Row id
   * @return {object} parent item or false
   */
  getParentItem(rowId)
  {
    const [index, parentIndex] = this.getIndex(rowId);
    if (parentIndex)
      return this.items[parentIndex];
    else
      return false;
  }

  _focusSelected()
  {
    this.container.querySelector(".highlight").focus();
  }

  /**
   * Render method to be called after each state change
   */
  _render()
  {
    this.container.dataset.subitems = this.hasSubtiems;
    const createRow = (text, selected) =>
    {
      const classes = ["row"];
      if (selected)
        classes.push("highlight");
      return html`<span class="${classes.join(" ")}" tabindex="${selected ? 0 : -1}" draggable="${this.draggable}">${text}</span>`;
    }
    const createList = ({id, selected, text}) => {
      return html`<li data-id="${id}">
                      ${createRow(text, selected)}
                  </li>`;
    }
    const result = this._data.map((row) => {
      const {id, subItems, selected, text, expanded} = row;
      if (subItems)
      {
        let subitems = "";
        if (expanded)
          subitems = html`<ul>${row.subItems.map(createList)}</ul>`;
        return html`<li data-id="${id}">
                        <button tabindex="-1" class="${expanded ? "expanded" : "collapsed"}"></button>${createRow(text, selected, subItems)}
                        ${subitems}
                    </li>`;
      }
      else
      {
        return createList(row);
      }
    });
    render(result, this.container);
  }
}

customElements.define('cba-list', List);
