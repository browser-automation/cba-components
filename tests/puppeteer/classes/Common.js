const {page} = require("../main");

class Common
{
  constructor(selector)
  {
    this._selector = selector;
  }
  async _getHandle()
  {
    return page().$(this._selector);
  }
  async _getShadowRoot()
  {
    const handle = await this._getHandle();
    return handle.evaluateHandle((component) => component.shadowRoot);
  }
  async _getHandleTextContent(handle)
  {
    return await (await handle.getProperty("textContent")).jsonValue();
  }
  async _executeMethod()
  {
    const handle = await this._getHandle();
    return handle.evaluate((component, methodName, ...args) => component[methodName](...args), ...arguments)
  }
  async _triggerEvent(handle, eventName, eventData = {})
  {
    return handle.evaluate((elem, eventName, eventData) => {
      return new Promise((resolve) => {
        elem.addEventListener(eventName, (e) =>
        {
          resolve(e);
        });
        const data = {bubbles: true};
        const event = new DragEvent(eventName, Object.assign(data, eventData));
        elem.dispatchEvent(event);
      });
      
    }, eventName, eventData);
  }
};

module.exports = {Common};
