import {html, render} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined';
import shadowCSS from './shadow.css';

class Table extends HTMLElement {
  constructor() {
    super();
    this._data = [];
    this.columns = [];
    this.tableElem = null;
    this.tableBodyElem = null;
    this.caption = null;
    this.idCount = 0;
    this.selectedId = -1;
    this.droppable = false;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <style>
      ${shadowCSS}
    </style>
    <div>
      <h2></h2>
      <table>
        <thead>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
    `;
  }

  set items(rowItems)
  {
    this._data = rowItems.map((rowItem) => 
    {
      if (!rowItem.id)
        rowItem.id = `cba-table-id-${++ this.idCount}`;
      return rowItem;
    });
    this._renderBody();
  }

  get items()
  {
    return JSON.parse(JSON.stringify(this._data));
  }

  static get observedAttributes() {
    return ["caption"];
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
    if (name === "caption")
    {
      this.caption = newValue;
      this._renderCaption();
    }
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this.tableElem = this.shadowRoot.querySelector("table");
    this.tableBodyElem = this.tableElem.querySelector("tbody");
    this.tableHeadElem = this.tableElem.querySelector("thead");
    this.caption = this.getAttribute("caption");
    this.droppable = this.getAttribute("droppable");
    for (const cbaColumn of this.querySelectorAll("cba-column"))
    {
      this.columns.push(cbaColumn.getAttribute("name"));
    }
    this._renderCaption();
    this._renderHead();

    // offset of the sticky header
    const offset = this.tableElem.offsetTop + "px";
    this.tableElem.style.setProperty("--head-columns-offset", offset);
    
    this._renderBody();
    this.tableBodyElem.addEventListener("click", ({target}) => 
    {
      const row = target.closest("tr");
      if (row)
        this.selectRow(row.dataset.id);
    });

    this.tableBodyElem.addEventListener("keydown", (e) =>
    {
      e.preventDefault();
      if (e.key === "ArrowDown")
        this.selectNextRow();
      if (e.key === "ArrowUp")
        this.selectPreviousRow();
    });

    // Dropping element
    if (this.droppable)
    {
      const clearDragEnter = (e) =>
      {
        const row = e.target.closest("tr");
        if (row && row.classList.contains("dragenter"))
          row.classList.remove("dragenter");
      };
      this.tableBodyElem.addEventListener("dragenter", (e) =>
      {
        const row = e.target.closest("tr");
        if (row && !row.classList.contains("dragenter"))
          row.classList.add("dragenter");
      });
      this.tableBodyElem.addEventListener("dragleave", (clearDragEnter));
      this.tableBodyElem.addEventListener("dragover", (e) =>
      {
        e.preventDefault();
      });
      this.tableBodyElem.addEventListener("drop", (e) =>
      {
        clearDragEnter(e);
        const row = e.target.closest("tr");
        const [rowId, listId] = e.dataTransfer.getData("text/plain").split("#");
        const {data} = document.getElementById(listId).getItem(rowId);
        this.addRow(data, row.dataset.id);
      });
    }
  }

  getAllColumns()
  {
    return this.querySelectorAll("cba-column");
  }

  addRow(data, after)
  {
    const items = this.items;
    const afterIndex = this._getItemIndex(after);
    if (after && afterIndex !== -1)
      items.splice(afterIndex + 1, 0, data);
    else
      items.push(data);

    this.items = items;
  }

  /**
   * Update a specific row
   * @param {object} data   row data
   * @param {object} rowId  (optional) if not specified row ID from data is used
   */
  updateRow(data, rowId)
  {
    const items = this.items;
    for (const item of items)
    {
      if (item.id === rowId || item.id === data.id)
      {
        for (const name in data)
          item[name] = data[name];
        break;
      }
    }
    this.items = items;
  }

  deleteRow(rowId)
  {
    const {id} = this.getSelectedItem();
    if (id === rowId)
      this.selectNextRow();
    this.items = this._data.filter(({id}) => id != rowId);
  }

  selectRow(rowId)
  {
    for (const item of this._data)
    {
      if (item.selected)
        delete item.selected;
      if (item.id === rowId)
        item.selected = true;
    }
    this._renderBody();
    this._focusSelected();
    this.dispatchEvent(new CustomEvent("select"));
  }

  selectNextRow()
  {
    const selectedIndex = this._getItemIndex(this.getSelectedItem().id);
    if (selectedIndex == -1)
      return;
    
    const itemToSelect = this._data[selectedIndex + 1] || this._data[0];
    this.selectRow(itemToSelect.id);
  }

  selectPreviousRow()
  {
    const selectedIndex = this._getItemIndex(this.getSelectedItem().id);
    if (selectedIndex == -1)
      return;
    
    const itemToSelect = this._data[selectedIndex - 1] ||
                         this._data[this._data.length - 1];
    this.selectRow(itemToSelect.id);
  }

  _getItemIndex(id)
  {
    for (let index = 0; index < this._data.length; index++)
      if (this._data[index].id === id)
        return index;
  }

  _getItemById(id)
  {
    return this._data.filter(item => item.id === id)[0];
  }

  getSelectedItem()
  {
    return this._data.filter(item => item.selected)[0]
  }

  _focusSelected()
  {
    this.tableBodyElem.querySelector(".highlight").focus();
  }

  /**
   * Render method to be called after each state change
   */
  _renderBody()
  {
    const createRow = ({id, data, texts, selected}) => {
      const selectedClass = selected ? "highlight" : undefined;
      return html`<tr data-id="${id}" class=${ifDefined(selectedClass)} tabindex=${selected ? 0 : -1}>${this.columns.map((name) => {
        return html`<td data-id="${name}">${texts[name]}</td>`;
      })}</tr>`;
    };
    render(html`${this._data.map(createRow)}`, this.tableBodyElem);
  }

  _renderHead()
  {
    const columnContent = html`<span class="label"></span>
                               <span class="resize"></span>`;
    const columns = html`<tr data-action="select"
                             data-key-down="next-sibling"
                             data-key-up="previouse-sibling">${this.columns.map((column) => 
                    html`<th data-id="${column}">${columnContent}</th>`)}</tr>`;
    render(columns, this.tableHeadElem);
  }

  _renderCaption()
  {
    this.shadowRoot.querySelector("h2").textContent = this.caption;
  }
}

/**
 * It's not possible to use <td>/<tr> as a slot content, that why we create a
 * new custom element which reflects the status of those elements in the shadow
 * DOM.
 */
class Column extends HTMLElement {
  constructor() {
    super();
    this.table = null;
    this.tableElem = null;
    this.columnName = null;
    this.columnWidth = "";
    this.tableHeadElem = null;

    this.draggingColumn = false;
    this.startX = 0;
    this.startWidth = 0;
  }

  static get observedAttributes() {
    return ["name", "width"];
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
    if (name === "name")
    {
      this.columnName = newValue;
      const column = this._getColumnById(oldValue);
      if (column)
        column.dataset.id = this.columnName;
    }
    if (name === "width")
    {
      this.columnWidth = newValue;
      this._render();
    }
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this.connected = true;
    this.table = this.closest("cba-table")
    this.tableElem = this.table.shadowRoot.querySelector("table");
    this.columnName = this.getAttribute("name");
    this.columnWidth = this.getAttribute("width");
    document.addEventListener("mousemove", this._onMouseMove.bind(this));
    document.addEventListener("mouseup", this._onMouseUp.bind(this));

    // Fetch content change
    const observer = new MutationObserver(this._render.bind(this));
    const config = {characterData: true,
                    attributes: false,
                    childList: false,
                    subtree: true };
    observer.observe(this, config);

    this._render();
    const column = this._getShadowColumn();
    this.tableElem.style.setProperty("--column-heigh", `${column.clientHeight}px`);

    const mouseDownListener = this._onMouseDown.bind(this);
    this._getShadowColumn().querySelector(".resize").addEventListener("mousedown", mouseDownListener);
  }

  _getShadowColumn()
  {
    return this.tableElem.querySelector(`th[data-id="${this.columnName}"]`);
  }

  _onMouseMove(ev)
  {
    if (this.draggingColumn)
    {
      const newWidth = this.startWidth + (ev.pageX - this.startX) + "px";
      this._getShadowColumn().style.width = newWidth;
      this.setAttribute("width", newWidth);
    }
  }

  _onMouseDown({pageX})
  {
    this.draggingColumn = true;
    if (this.tableElem.style.width != "max-content")
    {
      this.table.getAllColumns().forEach(column => column._convertWidthToPixel());
      this.tableElem.style.width = "max-content";
    }
    this.startWidth = this._getShadowColumn().clientWidth;
    this.startX = pageX;
  }

  _convertWidthToPixel()
  {
    this.setAttribute("width", this._getShadowColumn().clientWidth + "px");
  }

  _onMouseUp()
  {
    this.draggingColumn = false;
  }

  _render()
  {
    const column = this._getShadowColumn();
    if (!column)
      return;

    column.style.width = this.columnWidth;
    column.querySelector(".label").textContent = this.textContent;
  }
}

customElements.define('cba-table', Table);
customElements.define('cba-column', Column);
