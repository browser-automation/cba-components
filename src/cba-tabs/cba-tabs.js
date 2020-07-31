class CbaTabs extends HTMLElement {
  constructor() {
    super();
    this.tabs = [];
    this.selectedTab = null;
  }
  connectedCallback()
  {
    this.tabs = [...this.querySelectorAll("cba-tab")];
    this.addEventListener("click", (e) =>
    {
      this.select(e.target.id);
    });

    this.addEventListener("keydown", (e) =>
    {
      const {key} = e;
      if (key === "ArrowDown" || key === "ArrowRight")
      {
        e.preventDefault();
        this.selectNextTab();
      }
      if (key === "ArrowUp" || key === "ArrowLeft")
      {
        e.preventDefault();
        this.selectPrevTab();
      }
    });
  }

  select(id, focus = true)
  {
    if (!id)
      return;

    this.tabs.forEach((tab) =>
    {
      tab._hide();
      if (tab.id === id)
      {
        tab._show(focus);
        this.selectedTab = tab;
      }
    });
  }

  _getSelectedTabIndex()
  {
    return this.tabs.indexOf(this.selectedTab);
  }

  selectNextTab()
  {
    const index = this._getSelectedTabIndex() + 1;
    this.select(this.tabs[index >= this.tabs.length ? 0 : index].id);
  }
  selectPrevTab()
  {
    const index = this._getSelectedTabIndex() - 1;
    this.select(this.tabs[index >= 0 ? index : this.tabs.length - 1].id);
  }
}

class CbaTab extends HTMLElement {
  constructor() {
    super();
    this.panel = null;
    this.tabs = null;
  }

  connectedCallback()
  {
    this.setAttribute("role", "tab");
    this.panel = document.querySelector(`[aria-labelledby=${this.id}]`);
    this.tabs = this.closest("cba-tabs");
  }

  _show(focus)
  {
    this.setAttribute("aria-selected", true);
    this.setAttribute("tabindex", "0");
    if (focus)
      this.focus();
    this.panel._show();
    this._dispatchTabChange();
  }

  _dispatchTabChange()
  {
    const event = new CustomEvent("tabChange", {"detail": this.id});
    this.tabs.dispatchEvent(event);
  }

  _hide()
  {
    this.removeAttribute("aria-selected");
    this.setAttribute("tabindex", "-1");
    this.panel._hide();
  }
}

class CbaPanel extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback()
  {
    this.setAttribute("role", "tabpanel");
    this.setAttribute("hidden", true);
  }

  _show()
  {
    this.removeAttribute("hidden");
  }

  _hide()
  {
    this.setAttribute("hidden", true);
  }
}

customElements.define('cba-tab', CbaTab);
customElements.define('cba-tabs', CbaTabs);
customElements.define('cba-panel', CbaPanel);
