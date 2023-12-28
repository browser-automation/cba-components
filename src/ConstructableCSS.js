/**
 * Currently Constructable Stylesheets are only supported in Chrome 73+, for the
 * browsers that do not support them importing the style into shadowDom should
 * be done by appending a child element.
 */
class ConstructableCSS
{
  /**
   * Initialize CSSStyleSheet element
   * @param {string} css Style Sheet string
   */
  constructor(css)
  {
    this.sheet = null;
    try
    {
      this.sheet = new CSSStyleSheet();
      this.sheet.replaceSync(css);
    }
    catch(e)
    {
      const style = document.createElement("style");
      style.textContent = css;
      this.sheet = style;
    }
  }
  /**
   * Import styles into Shadow DOM
   * @param {ShadowRoot} shadowRoot - Shadow DOM root
   */
  load(shadowRoot)
  {
    if (this.sheet instanceof CSSStyleSheet)
      shadowRoot.adoptedStyleSheets = [this.sheet];
    else
      shadowRoot.appendChild(this.sheet.cloneNode(true));
  }
}

export default ConstructableCSS;
