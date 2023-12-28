import {html, render} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import shadowCSS from './shadow.css';
import ConstructableCSS from '../ConstructableCSS';

const constructableCSS = new ConstructableCSS(shadowCSS);


/**
 * @typedef  {{[key: string]: string}} TableItemTexts
 */

/**
 * @typedef  {object} TableItem
 * @property {string} [id] - unique id of the row.
 * @property {TableItemTexts} texts - texts for each cell. Key is column name.
 * @property {any} data - payload.
 */

export class Table extends HTMLElement
{
  constructor()
  {
    super();
    this._data = [];
    /** @type {string[]} */
    this.columns = [];
    this.tableElem = null;
    this.tableBodyElem = null;
    this.caption = null;
    this.idCount = 0;
    this.selectedId = -1;
    this.droppable = false;
    this.reorder = false;
    this.reordering = false;
    this.rowLastHoverId = null;

    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
    <div id="container">
      <h2></h2>
      <table>
        <thead>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
    `;
    constructableCSS.load(this.shadowRoot);
  }

  /**
   * Populate and render items ensuring the ids
   * @param {Array} rowItems Items, item contains of: {id, data, text: {data,
   *                                                   event, value}}
   */
  set items(rowItems)
  {
    this._data = rowItems.map((rowItem) =>
    {
      if (!rowItem.id)
      {
        while (this.getItem(`cba-table-id-${++this.idCount}`))
        {}
        rowItem.id = `cba-table-id-${this.idCount}`;
      }
      return rowItem;
    });
    this._renderBody();
  }

  /**
   * Get Items
   * @returns {Array}
   */
  get items()
  {
    return JSON.parse(JSON.stringify(this._data));
  }

  static get observedAttributes()
  {
    return ["caption"];
  }

  /**
   * Called each time an attribute on the custom element is changed
   * @param {string} name attribute name
   * @param {string} oldValue Old value of the attribute
   * @param {string} newValue New value of the attribute
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
    this.containerElem = this.shadowRoot.querySelector("#container");
    this.caption = this.getAttribute("caption");
    this.droppable = this.getAttribute("droppable");
    this.reorder = this.getAttribute("reorder");
    for (const cbaColumn of this.querySelectorAll("cba-column"))
    {
      this.columns.push(cbaColumn.getAttribute("text"));
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

    this.tableBodyElem.addEventListener("mouseover", ({target})=>
    {
      const row = target.closest("tr");
      if (row && row.dataset.id != this.rowLastHoverId)
      {
        this.rowLastHoverId = row.dataset.id;
        const detail = {"rowId": this.rowLastHoverId};
        this.dispatchEvent(new CustomEvent("rowmouseover", {detail}));
      }
    });

    this.tableBodyElem.addEventListener("mouseout", ({target}) =>
    {
      const row = target.closest("tr");
      if (row && row.dataset.id === this.rowLastHoverId)
      {
        this.rowLastHoverId = row.dataset.id;
        const detail = {"rowId": this.rowLastHoverId};
        this.dispatchEvent(new CustomEvent("rowmouseout", {detail}));
        this.rowLastHoverId = null;
      }
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
    if (this.droppable || this.reorder)
    {
      const clearDragEnter = (e) =>
      {
        const row = e.target.closest("tr");
        if (row && row.classList.contains("dragenter"))
        {
          row.classList.remove("dragenter");
        }
        this.containerElem.classList.remove("dragenter");
      };
      this.tableBodyElem.addEventListener("drag", (e) =>
      {
        // Unless the dragged item is hovered over top of the container the
        // scrolling doesn't work. This way we force scroll on top item.
        if (e.clientY < 50)
        {
          this.containerElem.scroll({
            top: this.containerElem.scrollTop - 100,
            behavior: "smooth"
          });
        }
      });
      this.tableBodyElem.addEventListener("dragenter", (e) =>
      {
        const row = e.target.closest("tr");
        if (row && !row.classList.contains("dragenter"))
          row.classList.add("dragenter");
      });
      this.tableBodyElem.addEventListener("dragend", (e) =>
      {
        const row = e.target;
        row.style.display = "table-row";
        clearDragEnter(e);
        this.reordering = false;
      });

      this.tableBodyElem.addEventListener("dragleave", clearDragEnter);
      this.tableBodyElem.addEventListener("dragover", (e) =>
      {
        e.preventDefault();
        const row = e.target.closest("tr");
        if (!row)
          return;

        const {y, height} = row.getBoundingClientRect();
        if ((e.y) - (y) > height/2)
        {
          if (row.classList.contains("add-above"))
            row.classList.remove("add-above");
          row.classList.add("add-below");
        }
        else
        {
          if (row.classList.contains("add-below"))
            row.classList.remove("add-below");
          row.classList.add("add-above");
        }
      });
      this.tableBodyElem.addEventListener("drop", (e) =>
      {
        e.preventDefault();
        clearDragEnter(e);
        this.containerElem.classList.remove("dragenter");
        const [dragRowId, dragId] = e.dataTransfer.getData("text/plain").split("#");
        const draggedSource = document.getElementById(dragId);
        let dropRowId = null;
        let dropAfter = false;
        const row = e.target.closest("tr");
        if (e.target.tagName !== "TBODY" && row)
        {
          dropRowId = row.dataset.id;
          dropAfter = row.classList.contains("add-below");
        }

        const drop = (item) =>
        {
          const dropIndex = this._getItemIndex(dropRowId);
          const itemBefore = dropAfter ? this._data[dropIndex] :
            this._data[dropIndex - 1];

          if (dropIndex == 0 && !dropAfter)
            this.addFirstRow(item);
          else if (!itemBefore)
            this.addRow(item);
          else
            this.addRow(item, itemBefore.id);
        };

        if (this.reordering)
        {
          const dragRowItem = this.getItem(dragRowId);
          this.deleteRow(dragRowId);
          drop(dragRowItem);
        }
        else if (draggedSource)
        {
          const draggedItem = draggedSource.getItem(dragRowId);
          if (draggedItem && draggedItem.data)
            drop(draggedItem.data);
        }
        this.dispatchEvent(new CustomEvent("dragndrop", {"detail": {
          dropRowId,
          dragRowId,
          dragId,
          dropAfter,
          reordered: this.reordering
        }}));
        dragCounter = 0;
      });

      // drag-n-drop when empty
      let dragCounter = 0;
      let isOnAfter = false;
      this.containerElem.addEventListener("dragenter", (e) =>
      {
        isOnAfter = false;
        if (e.target.id === "container")
        {
          this.containerElem.classList.add("dragenter");
        }
        else
        {
          dragCounter++;
        }
        if (e.target.tagName === "TBODY")
        {
          dragCounter++;
          isOnAfter = true;
        }
      });

      this.containerElem.addEventListener("dragleave", (e) =>
      {
        if (e.target.id === "container" && !isOnAfter)
        {
          this.containerElem.classList.remove("dragenter");
        }
        else
        {
          dragCounter--;
          if (dragCounter === 0)
            this.containerElem.classList.add("dragenter");
        }
      });
    }
    if (this.reorder)
    {
      this.tableBodyElem.addEventListener("dragstart", (e) =>
      {
        this.reordering = true;
        const row = e.target.closest("[data-id]");

        // Hiding dragged row
        window.requestAnimationFrame(()=>
        {
          row.style.display = "none";
        });
        const rowId = row.dataset.id;
        e.dataTransfer.setData("text/plain", `${rowId}#${this.id}`);
      });
    }
  }

  /**
   * Gets all cba-column elements
   * @returns {Array} array of nodes
   */
  getAllColumns()
  {
    return this.querySelectorAll("cba-column");
  }

  /**
   * Add a new row to the end or after a specific item
   * @param {TableItem} data - new row data
   * @param {string} after - (optional) rowId that comes after
   */
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
   * Unshifts a new row to items
   * @param {TableItem} data  new row data
   */
  addFirstRow(data)
  {
    const items = this.items;
    items.unshift(data);
    this.items = items;
  }

  /**
   * Update a specific row
   * @param {TableItem} data   row data
   * @param {string} rowId  (optional) if not specified row ID from data is used
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

  /**
   * Deletes a specific row
   * @param {string} rowId Row id
   */
  deleteRow(rowId)
  {
    const {id} = this.getSelectedItem();
    if (id === rowId)
      this.selectNextRow();
    this.items = this._data.filter(({id}) => id != rowId);
  }

  /**
   * Selects a specific row
   * @param {string}  rowId Row id
   * @param {boolean} focus trigger row focus
   */
  selectRow(rowId, focus = true)
  {
    for (const item of this._data)
    {
      if (item.selected)
        delete item.selected;
      if (item.id === rowId)
        item.selected = true;
    }
    this._renderBody();
    if (focus)
      this._focusSelected();

    this.dispatchEvent(new CustomEvent("select"));
  }

  /**
   * Selects next row
   */
  selectNextRow()
  {
    const selectedIndex = this._getItemIndex(this.getSelectedItem().id);
    if (selectedIndex == -1)
      return;

    const itemToSelect = this._data[selectedIndex + 1] || this._data[0];
    this.selectRow(itemToSelect.id);
  }

  /**
   * Selects previous row
   */
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

  /**
   * Get a specific row record
   * @param {string} id - Row id.
   * @returns {TableItem|false}
   */
  getItem(id)
  {
    const item = this._data.filter(item => item.id === id)[0];
    return item ? item : false;
  }

  /**
   * Gets selected row record
   * @returns {TableItem|false}
   */
  getSelectedItem()
  {
    const selectedItem = this._data.filter(item => item.selected)[0];
    if (!selectedItem)
      return false;
    return selectedItem;
  }

  _focusSelected()
  {
    const selectedItem = this.tableBodyElem.querySelector(".highlight");
    if (selectedItem)
      selectedItem.focus();
  }

  /**
   * Get cell value to be used as it's textContent
   * @param {object} item row item object
   * @param {string} colText "text" attribute value of current cba-column
   */
  _getText(item, colText)
  {
    if (colText.includes("."))
    {
      return colText.split(".").reduce((acc, prop) => acc[prop] || "" , item);
    }
    else if (colText.includes("$"))
    {
      return colText.split("$").reduce((acc, prop, index, {length}) =>
      {
        if (index -1 === length)
          return acc[parseInt(prop, 10)] || "";
        else
          return acc[prop] || "";
      }, item);
    }
    return item[colText] || "";
  }

  /**
   * Render method to be called after each state change
   */
  _renderBody()
  {
    const createRow = (rowData) =>
    {
      const {id, selected} = rowData;
      const selectedClass = selected ? "highlight" : undefined;
      return html`<tr data-id="${id}" class=${ifDefined(selectedClass)} draggable="${ifDefined(this.reorder)}" tabindex=${selected ? 0 : -1}>${this.columns.map((name) =>
      {
        const text = this._getText(rowData, name);
        return html`<td data-id="${name}" title="${text}">${text}</td>`;
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
class Column extends HTMLElement
{
  constructor()
  {
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

  static get observedAttributes()
  {
    return ["text", "width"];
  }

  /**
   * Called each time an attribute on the custom element is changed
   * @param {string} name attribute name
   * @param {string} oldValue Old value of the attribute
   * @param {string} newValue New value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue)
  {
    if (oldValue === newValue || !this.connected)
    {
      return;
    }
    if (name === "text")
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
    this.columnName = this.getAttribute("text");
    this.columnWidth = this.getAttribute("width");
    document.addEventListener("mousemove", this._onMouseMove.bind(this));
    document.addEventListener("mouseup", this._onMouseUp.bind(this));

    // Fetch content change
    const observer = new MutationObserver(this._render.bind(this));
    const config = {characterData: true,
      attributes: false,
      childList: false,
      subtree: true};
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
