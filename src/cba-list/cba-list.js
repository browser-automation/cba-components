import {html, render} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined';
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
    const smth = (rowItem) =>
    {
      if (!rowItem.id)
        rowItem.id = `cba-list-id-${++ this.idCount}`;
      if (rowItem.subItems)
      {
        rowItem.subItems = rowItem.subItems.map(smth);
        return rowItem;
      }
      else
        return rowItem;
    }
    this._data = rowItems.map(smth);
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


  /**
   * Render method to be called after each state change
   */
  _render()
  {
    const createRow = (text) => html`<span class="row">${text}</span>`;
    const createList = ({id, text}) => html`<li data-id="${id}">${createRow(text)}</li>`;
    const result = this._data.map((row) => {
      if (row.subItems)
      {
        return html`<li data-id="${row.id}">${createRow(row.text)}
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
