import shadowCSS from './shadow.css';

class CbaButton extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        ${shadowCSS}
      </style>
      <button type="button"><slot></slot></button>`;
  }
}

customElements.define("cba-button", CbaButton);
