class Table extends HTMLElement {
  constructor() {
    super();
    this.data = [];
    this.columns = {};
    this.tableElem = null;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <style>
      table
      {
        border: solid 1px grey;
        width: 100%;
        height: 100%;
      }
    </style>
    <table>
      <tr id="head"></tr>
    </table>
    `;
  }
  /**
   * {
   *   id:    "itemId1",
   *   data:  {datasetname: "/"},
   *   texts: {data-text-value: "example.com", data-text-value: "3 Cookies"}
   * }
   */

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this.tableElem = this.shadowRoot.querySelector("table");
    this._render();
  }

  /**
   * Render method to be called after each state change
   */
  _render()
  {
  }
}

class Column extends HTMLElement {
  constructor() {
    super();
    this.table = null;
    this.tableElem = null;
    this.columnName = null;
    this.columnWidth = "";
    this.tableHeadElem = null;
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
    this.tableHeadElem = this.table.shadowRoot.querySelector("#head");
    this.columnName = this.getAttribute("name");
    this.columnWidth = this.getAttribute("width");

    // Fetch content change
    const observer = new MutationObserver(this._render.bind(this));
    const config = { characterData: true, attributes: false, childList: false, subtree: true };
    observer.observe(this, config);

    this._render();
  }

  _getColumnById(name)
  {
    return this.tableElem.querySelector(`th[data-id="${name}"]`);
  }

  _render()
  {
    const column = this._getColumnById(this.columnName);
    const nextColumnElement = this.tableElem.querySelector(`th[data-id="${this.nextSibling.columnName}]"`);
    if (!column)
    {
      const columnElement = document.createElement("th");
      columnElement.dataset.id = this.columnName;
      columnElement.style.width = this.columnWidth;
      columnElement.textContent = this.textContent;
      if (nextColumnElement)
      {
        nextColumnElement.insertBefore(columnElement, nextColumnElement);
      }
      else
      {
        this.tableHeadElem.appendChild(columnElement);
      }
    }
    else
    {
      column.style.width = this.columnWidth;
      column.textContent = this.textContent;
    }
  }
}

customElements.define('cba-table', Table);
customElements.define('cba-column', Column);
