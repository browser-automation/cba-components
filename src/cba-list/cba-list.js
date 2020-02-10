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
