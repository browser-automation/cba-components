<<<<<<< HEAD
/* eslint-disable */
import {html, render} from 'lit-html';
=======
import { html, render } from 'lit-html';
>>>>>>> 098432d (issue #45 - implemented cba-list-new component)
import shadowCSS from './shadow.css';
import ConstructableCSS from '../ConstructableCSS';

const constructableCSS = new ConstructableCSS(shadowCSS);

class List extends HTMLElement {
  constructor() {
    super();
    this.container = null;
    this.subheading = null;
    this.idCount = 0;
    this.drag = false;
    this.sort = false;
    this.connected = false;
    this.hasSubtiems = false;
    this._data = [
    ];

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <div id="container">
      <h2></h2>
      <h3 id="column"><a href="#"></a></h3>
      <div id="list-body">
        <div id="group"></div>
        <ul></ul>
      </div>
      <div id="tooltip"></div>
    </div>
    `;
    constructableCSS.load(this.shadowRoot);
  }

  // add-item
  _addItemsHandler({ target }) {
    // console.log("list");
    // Addrow
    this.dispatchEvent(new CustomEvent("addItem"))
  };


  /**
   * Populate and render items ensuring the ids and sorting
   * @param {array} rowItems Items, item contains of: {id, data, text}
   */
  set items(rowItems) {
    this.hasSubtiems = false;
    const setId = (rowItem) => {
      if (!rowItem.id) {
        while (this.getItem(`cba-list-id-${++this.idCount}`)) { }
        rowItem.id = `cba-list-id-${this.idCount}`;
      }
      if (rowItem.subItems) {
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
  get items() {
    return JSON.parse(JSON.stringify(this._data));
  }

  static get observedAttributes() {
    return ["sort", "heading", "subheading"];
  }

  /**
   * Called each time an attribute on the custom element is changed
   * @param {String} name attribute name
   * @param {String} oldValue Old value of the attribute
   * @param {String} newValue New value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.connected) {
      return;
    }
    if (name === "sort") {
      this.sort = this.getAttribute("sort");
      this._sortItems();
      this._render();
    }
    if (name === "heading" || name === "subheading") {
      this._renderHeading();
    }
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback() {
    this.heading = this.shadowRoot.querySelector("h2");
    this.subheading = this.shadowRoot.querySelector("h3 a");
    this.container = this.shadowRoot.querySelector("ul");
    this.tooltip = this.shadowRoot.querySelector("#tooltip");
    this.subheadingContainer = this.shadowRoot.querySelector("#column");
    this.drag = this.getAttribute("drag") == "true";
    this.sort = this.getAttribute("sort");
    this.tooltipText = this.getAttribute("tooltip-text");
    this.tooltipLink = this.getAttribute("tooltip-link");
    this.tooltipLinkText = this.getAttribute("tooltip-link-text");
    this.tooltipLinkTextDefault = "Learn more";
    this.connected = true;
    this.group = this.shadowRoot.querySelector("#group");

    this.container.addEventListener("click", ({ target }) => {
      if (target.classList.contains("collapsed") || target.classList.contains("expanded")) {
        const item = this.getItem(target.parentElement.dataset.id);
        this.setExpansion(item.id, !item.expanded);
        return;
      }
      const row = target.closest(".row");
      if (row) {
        this.selectRow(row.parentElement.dataset.id);
      }
    });

    if (this.drag) {
      this.container.addEventListener("dragstart", (e) => {
        const rowId = e.target.closest("[data-id]").dataset.id;
        e.dataTransfer.setData("text/plain", `${rowId}#${this.id}`);
      });
    }

    this.container.addEventListener("keydown", (e) => {
      const { editable } = this.getSelectedItem();
      if (e.key === "ArrowDown" && !editable) {
        e.preventDefault();
        this.selectNextRow();
      }
      if (e.key === "ArrowUp" && !editable) {
        e.preventDefault();
        this.selectPreviousRow();
      }
      if (e.key === "ArrowRight" && !editable) {
        e.preventDefault();
        this.setExpansion(this.getSelectedItem().id, true);
      }
      if (e.key === "ArrowLeft" && !editable) {
        e.preventDefault();
        const selectedId = this.getSelectedItem().id;
        const parentItem = this.getParentItem(selectedId);
        if (parentItem) {
          this.selectRow(parentItem.id);
          this.setExpansion(parentItem.id, false);
        }
        else
          this.setExpansion(selectedId, false);
      }
    });

    if (this.sort) {
      this.subheadingContainer.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.sort == "desc")
          this.setAttribute("sort", "asc");
        else if (this.sort == "asc")
          this.setAttribute("sort", "desc");
        else
          this.setAttribute("sort", "asc");
      });
    }
    this._renderGroup();
    this._renderHeading();
    this._render();
  }

  _renderGroup() {
    const result = html`<span>Group</span><button @click=${this._addItemsHandler.bind(this)} class="add-item"></button>`;
    render(result, this.group);
  }

  _sortItems() {
    let sortMethod = null;
    if (this.sort == "asc") {
      sortMethod = (a, b) => {
        return a.text.localeCompare(b.text, undefined, { numeric: true })
      }
    }
    if (this.sort == "desc") {
      sortMethod = (a, b) => {
        return b.text.localeCompare(a.text, undefined, { numeric: true });
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
  selectRow(rowId) {
    const updateSelected = (items) => {
      for (const item of items) {
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
  setExpansion(id, state) {
    this._findItem("id", id).expanded = state;
    this._render();
    this.dispatchEvent(new CustomEvent("expand"));
  }

  /**
   * Get textContent of the row element
   * @param {string} id Row ID 
   * @return {string} row's textContent
   */
  _getRowContent(id) {
    const rowElement = this.container.querySelector(`[data-id="${id}"] .row`);
    return rowElement ? rowElement.textContent : "";
  }

  /**
   * Updates all editable items with modified content and unset all editables
   */
  saveEditables() {
    while (this._findItem("editable", true)) {
      const item = this._findItem("editable", true);
      item.text = this._getRowContent(item.id);
      item.editable = false;
    }
    this._render();
  }

  /**
   * Make specific item editable
   * @param {string} id Row ID  
   * @param {boolean} state editable state (true means editable)
   */
  setEditable(id, state) {
    this._findItem("id", id).editable = state;
    this._render();
    this.selectRow(id);
  }

  /**
   * Selects next row
   */
  selectNextRow() {
    const item = this.getSelectedItem();
    const [index, parentIndex] = this.getIndex(item.id);
    if (parentIndex >= 0) {
      const items = this._data[parentIndex].subItems;
      const itemToSelect = items[index + 1] ||
        this._data[parentIndex + 1] ||
        this._data[0];
      this.selectRow(itemToSelect.id);
    }
    else {
      let itemToSelect = this._data[index + 1] || this._data[0];
      if (item.subItems && item.expanded)
        itemToSelect = item.subItems[0];
      this.selectRow(itemToSelect.id);
    }
  }

  /**
   * Selects previous row
   */
  selectPreviousRow() {
    const item = this.getSelectedItem();
    const [index, parentIndex] = this.getIndex(item.id);
    if (parentIndex >= 0) {
      const items = this._data[parentIndex].subItems;
      const itemToSelect = items[index - 1] ||
        this._data[parentIndex] ||
        this._data[this._data.length - 1];
      this.selectRow(itemToSelect.id);
    }
    else {
      const previousItem = this._data[index - 1];
      let itemToSelect = this._data[index - 1] || this._data[this._data.length - 1];
      if (previousItem && previousItem.subItems && previousItem.expanded)
        itemToSelect = previousItem.subItems[previousItem.subItems.length - 1];
      this.selectRow(itemToSelect.id);
    }
  }

  _findItem(property, value, parent) {
    const search = (items, parentItem) => {
      for (const item of items) {
        if (item[property] && item[property] === value) {
          if (parent) {
            if (parentItem)
              return parentItem;
            else
              return false;
          }
          else
            return item
        }
        if (item.subItems) {
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
  getItem(rowId) {
    const item = this._findItem("id", rowId);
    return item ? JSON.parse(JSON.stringify(item)) : false;
  }

  /**
   * Get index and parentIndex for a row item.
   * @param {string} rowId ID of the row item
   * @return {array} [index, parentIndex]
   */
  getIndex(rowId) {
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
  getSelectedItem() {
    const item = this._findItem("selected", true);
    return item ? JSON.parse(JSON.stringify(item)) : false;
  }

  /**
   * Adds(pushes) a new row to the root or as a sub item
   * @param {object} data Row data
   * @param {string} parentOrSubId (optional) Id specifying parent item
   */
  addRow(data, parentOrSubId) {
    const items = this.items;
    const [index, parentIndex] = this.getIndex(parentOrSubId);
    if (parentOrSubId) {
      if (parentIndex != -1) {
        items[parentIndex].subItems.push(data);
      }
      else if (index != -1) {
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
  updateRow(data, rowId) {
    const item = this._findItem("id", rowId);
    for (const key in data)
      item[key] = data[key];
    this._render();
  }

  /**
   * Deletes a specific row
   * @param {string} rowId Row id
   */
  deleteRow(rowId) {
    const [index, parentIndex] = this.getIndex(rowId);
    if (index < 0)
      return;

    const { id } = this.getSelectedItem();
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
  getParentItem(rowId) {
    const [index, parentIndex] = this.getIndex(rowId);
    if (parentIndex >= 0)
      return this.items[parentIndex];
    else
      return false;
  }

  _focusSelected() {
    const selectedItem = this.container.querySelector(".highlight");
    if (selectedItem)
      selectedItem.focus();
  }

  _renderHeading() {
    this.heading.textContent = this.getAttribute("heading");
    this.subheading.textContent = this.getAttribute("subheading");
  }

  /**
   * Get tooltip text from the item
   * @param {object} item row item object
   * @param {string} tooltip "tooltip" attribute value
   */
  _getText(item, tooltip) {
    if (!tooltip || !item) {
      return "";
    }
    if (tooltip.includes(".")) {
      return tooltip.split(".").reduce((acc, prop) => acc[prop] || "", item);
    }
    else if (tooltip.includes("$")) {
      return tooltip.split("$").reduce((acc, prop, index, { length }) => {
        if (index - 1 === length)
          return acc[parseInt(prop, 10)] || "";
        else
          return acc[prop] || "";
      }, item);
    }
    return item[tooltip] || "";
  }

  showTooltip({ target }) {
    const itemId = target.closest("li").dataset.id;
    const item = this.getItem(itemId);
    const infoText = this._getText(item, this.tooltipText);
    if (infoText) {
      // On first tooltip render when cba-list is placed inside of flexbox the
      // tooltip location is calculated wrongly, recalculation fixes that.
      if (!this.tooltip.querySelector("p"))
        this._renderTooltip(target, item);
      this._renderTooltip(target, item);
    }
  }

  _renderTooltip(infoElem, item) {
    const infoText = this._getText(item, this.tooltipText);
    const infoLink = this._getText(item, this.tooltipLink);
    const infoLinkText = this._getText(item, this.tooltipLinkText) ||
      this.tooltipLinkTextDefault;
    const subitems = infoLink ? html`<a href="${infoLink}">${infoLinkText}</a>` : "";
    render(html`<p>${infoText}</p>${subitems}`, this.tooltip);
    const infoRect = infoElem.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    this.style.setProperty("--tooltip-offset-y", `${infoRect.top}px`);
    this.style.setProperty("--tooltip-offset-x", `${tooltipRect.width}px`);
    this.tooltip.classList.add("visible");
  }

  hideTooltip() {
    this.tooltip.classList.remove("visible")
  }

  _addSubitemsHandler({ target }) {
    const { id } = target.closest("[data-id]").dataset;
    this.dispatchEvent(new CustomEvent("addSubitem", { detail: { id } }))
  };



  /**
   * Render method to be called after each state change
   */
  _render() {
    this.container.dataset.subitems = this.hasSubtiems;
    const createRow = (item) => {
      const { text, selected, editable = false } = item;
      const classes = ["row"];
      if (selected)
        classes.push("highlight");
      const addSubitemsButton = html
        `
      <div class="subitem__wrapper">
        <button class="subitem-btn" @click=${this._addSubitemsHandler.bind(this)}></button>
        <button class="kebab-btn" ></button>
      </div>
      `;
      const row = html`<div class="${classes.join(" ")}" tabindex="${selected ? 0 : -1}" draggable="${this.drag}" contenteditable="${editable}" title="${text}">${text}${addSubitemsButton}</div>`;
      const infoText = this._getText(item, this.tooltipText);
      if (infoText) {
        const tooltip = html`<span class="${infoText ? "hasInfo" : ""}" @mouseenter="${this.showTooltip.bind(this)}" @mouseleave="${this.hideTooltip.bind(this)}"></span>`;
        return html`${tooltip}${row}`;
      }
      else {
        return row;
      }
    }
    const createList = (item) => {
      const { id } = item;
      return html`<li data-id="${id}">
                      ${createRow(item)}
                  </li>`;
    }
    const result = this._data.map((row) => {
      const { id, subItems, expanded } = row;
      if (subItems) {
        let subitems = "";
        if (expanded)
          subitems = html`<ul>${row.subItems.map(createList)}</ul>`;
        return html`<li data-id="${id}">
                        <button tabindex="-1" class="${expanded ? "expanded" : "collapsed"}"></button>${createRow(row)}
                        ${subitems}
                    </li>`;
      }
      else {
        return createList(row);
      }
    });
    render(result, this.container);
  }
}

customElements.define('cba-list-new', List);
