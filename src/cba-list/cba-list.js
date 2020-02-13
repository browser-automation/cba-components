import {html, render} from 'lit-html';
import shadowCSS from './shadow.css';

class List extends HTMLElement {
  constructor() {
    super();
    this.container = null;
    this.idCount = 0;
    this._data = [
    ];

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <style>
      ${shadowCSS}
    </style>
    <div>
      <h2>Heading</h2>
      <h3><a href="#">Column</a></h3>
      <ul>
        <li><span class="row">List1</span></li>
        <li class="highlight"><span class="row">List2</span>
          <ul><li><span class="row">List2-2</span></li></ul>
        </li>
      </ul>
    </div>
    `;
  }

  set items(rowItems)
  {
    const setId = (rowItem) =>
    {
      if (!rowItem.id)
        rowItem.id = `cba-list-id-${++ this.idCount}`;
      if (rowItem.subItems)
      {
        rowItem.subItems = rowItem.subItems.map(setId);
        return rowItem;
      }
      else
        return rowItem;
    }
    this._data = rowItems.map(setId);
    this._render();
  }

  get items()
  {
    return JSON.parse(JSON.stringify(this._data));
  }

  static get observedAttributes() {
    return [];
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
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this.container = this.shadowRoot.querySelector("ul");

    this.container.addEventListener("click", ({target}) => 
    {
      const row = target.closest(".row");
      if (row)
        this.selectRow(row.parentElement.dataset.id);
    });

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
    });
    this._render();
  }

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
      if (item.subItems)
        itemToSelect = item.subItems[0];
      this.selectRow(itemToSelect.id);
    }
  }

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
      if (previousItem && previousItem.subItems)
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

  getSelectedItem()
  {
    const item = this._findItem("selected", true);
    return item ? JSON.parse(JSON.stringify(item)) : false;
  }

  addRow(data, parentOrSubId)
  {
    const items = this.items;
    const [index, parentIndex] = this.getIndex(parentOrSubId);
    console.log(index, parentIndex);
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

  updateRow(data, rowId)
  {
    const item = this._findItem("id", rowId);
    for (const key in data)
      item[key] = data[key];
    this._render();
  }

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

  _focusSelected()
  {
    this.container.querySelector(".highlight").focus();
  }

  /**
   * Render method to be called after each state change
   */
  _render()
  {
    const createRow = (text, selected) =>
    {
      const classes = ["row"];
      if (selected)
        classes.push("highlight");
      return html`<span class="${classes.join(" ")}" tabindex="${selected ? 0 : -1}">${text}</span>`;
    }
    const createList = ({id, selected, text}) => {
      return html`<li data-id="${id}">
                      ${createRow(text, selected)}
                  </li>`;
    }
    const result = this._data.map((row) => {
      const {id, subItems, selected, text} = row;
      if (subItems)
      {
        return html`<li data-id="${id}">
                        ${createRow(text, selected)}
                        <ul>${row.subItems.map(createList)}</ul>
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
