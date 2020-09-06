import {html, render} from 'lit-html';
import shadowCSS from './shadow.css';
import ConstructableCSS from '../ConstructableCSS';

const constructableCSS = new ConstructableCSS(shadowCSS);

class List extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
    <slot></slot>
    <div id="tooltip" role="tooltip"></div>
    `;
    constructableCSS.load(this.shadowRoot);
  }

  /**
   * Invoked each time the custom element is appended into a DOM element
   */
  connectedCallback()
  {
    this.tooltipElem = this.shadowRoot.querySelector("#tooltip");
    this.text = this.getAttribute("text");
    this.link = this.getAttribute("link");
    this.linkText = this.getAttribute("link-text");
    this.heading = this.getAttribute("heading");
    this.addEventListener("mouseover", this._render);
    this._setAxis();
    this._render();
  }

  static get observedAttributes() {
    return ["arrow"];
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
    if (name === "arrow")
    {
      this._setAxis();
    }
  }

  setData(data) {
    const {text, link, linkText, heading} = data;
    if (text)
      this.text = text;
    if (link)
      this.link = link;
    if (linkText)
      this.linkText = linkText;
    if (heading)
      this.heading = heading;
  }

  _setAxis() {
    this.arrow = this.getAttribute("arrow") === "y" ? "y" : "x";
    this.tooltipElem.dataset.arrow = this.arrow;
  }

  /**
   * Calculates the directions with most available space to open the popup.
   */
  _setDirection()
  {
    const clientRect = this.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const distanceLeft = clientRect.left;
    const distanceTop = clientRect.top;
    const distanceRight = viewportWidth - clientRect.right;
    const distanceBottom = viewportHeight - clientRect.bottom;
    const placementX = distanceLeft - distanceRight > 0 ? "left" : "right";
    const placementY = distanceTop - distanceBottom > 0 ? "top" : "bottom";
    this.tooltipElem.dataset.tooltip = `${placementX}-${placementY}`;
  }

  disable() {
    this.setAttribute("disabled", true);
  }

  enable() {
    this.removeAttribute("disabled");
  }

  isDisabled() {
    return this.getAttribute("disabled");
  }

  /**
   * Sets --content-width and --content-height to be used in CSS.
   */
  _setContentSizeCss()
  {
    const clientRect = this.getBoundingClientRect();
    this.style.setProperty("--content-width", `${clientRect.width}px`);
    this.style.setProperty("--content-height", `${clientRect.height}px`);
  }

  /**
   * Render method to be called after each state change
   */
  _render()
  {
    if (this.isDisabled())
      return;

    this._setContentSizeCss();
    this._setDirection();
    const paragraph = html`<p>${this.text}</p>`;
    let anchor = "";
    if (this.link && this.linkText)
      anchor = html`<a href="${this.link}" target="_blank">${this.linkText}</a>`;
    let heading = "";
    if (this.heading)
      heading = html`<h4>${this.heading}</h4>`;

    render(html`${heading}${paragraph}${anchor}`, this.tooltipElem);
  }
}

customElements.define("cba-tooltip", List);
