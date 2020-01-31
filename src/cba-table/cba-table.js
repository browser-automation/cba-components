import {html, render} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined';
import shadowCSS from './shadow.css';

class Table extends HTMLElement {
  constructor() {
    super();
    this.data = [];
    this.columns = [];
    this.tableElem = null;
    this.tableBodyElem = null;
    this.caption = null;

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

  set items(data)
  {
    this.data = data;
    this._renderBody();
  }

  get items()
  {
    // TODO clone?
    return this.data;
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
    for (const cbaColumn of this.querySelectorAll("cba-column"))
    {
      this.columns.push(cbaColumn.getAttribute("name"));
    }
    this._renderBody();
    this._renderHead();
    this._renderCaption();
    this.tableBodyElem.addEventListener("click", ({target}) => 
    {
      const row = target.closest("tr");
      if (row)
        this.selectRow(row.dataset.id);
    });
  }

  getAllColumns()
  {
    return this.querySelectorAll("cba-column");
  }

  deleteRow(rowId)
  {
    this.items = this.items.filter(({id}) => id != rowId);
  }

  selectRow(rowId)
  {
    for (const item of this.items)
    {
      if (item.selected)
        delete item.selected;
      if (item.id === rowId)
        item.selected = true;
    }
    this._renderBody();
    this._focusSelected();
  }

  getSelectedRow()
  {
    return this.items.filter(item => item.selected)[0]
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
    render(html`${this.data.map(createRow)}`, this.tableBodyElem);
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
