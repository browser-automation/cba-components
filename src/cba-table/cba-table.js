import {html, render} from 'lit-html';
import shadowCSS from './shadow.css';

class Table extends HTMLElement {
  constructor() {
    super();
    this.data = [
      {
        id: "row1",
        data: "Info",
        texts: {
          data: "Data1",
          event: "Event1",
          value: "Value1"
        }
      },
      {
        id: "row2",
        data: "Info",
        texts: {
          data: "Data2",
          event: "Event2",
          value: "Value2"
        }
      },
      {
        id: "row3",
        data: "Info",
        texts: {
          data: "Data3",
          event: "Event3",
          value: "Value3"
        }
      }
    ];
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
      <table>
        <caption></caption>
        <thead>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
    `;
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
  }

  getAllColumns()
  {
    return this.querySelectorAll("cba-column");
  }

  /**
   * Render method to be called after each state change
   */
  _renderBody()
  {
    const createRow = ({id, data, texts}) => {
      return html`<tr data-id="${id}">${this.columns.map((name) => {
        return html`<td data-id="${name}">${texts[name]}</td>`;
      })}</tr>`;
    };
    render(html`${this.data.map(createRow)}`, this.tableBodyElem);
  }

  _renderHead()
  {
    const columns = html`<tr>${this.columns.map((column) => html`<th data-id="${column}"></th>`)}</tr>`;
    render(columns, this.tableHeadElem);
  }

  _renderCaption()
  {
    this.tableElem.querySelector("caption").textContent = this.caption;
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
    const mouseDownListener = this._onMouseDown.bind(this);
    this._getShadowColumn().addEventListener("mousedown", mouseDownListener);
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
    column.textContent = this.textContent;
  }
}

customElements.define('cba-table', Table);
customElements.define('cba-column', Column);
