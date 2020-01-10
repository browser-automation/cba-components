class Table extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>
    </style>
    <table></table>
    `;
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this._render();
  }

  /**
   * Render method to be called after each state change
   */
  _render()
  {
  }
}

customElements.define('cba-table', Table);
