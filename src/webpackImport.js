export function loadComponent(scope, module, url) {
  return async () => {

    await loadScript(url)

    await __webpack_init_sharing__("default");
    const container = window[scope];
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    debugger
    return Module;
  };
}

export function loadScript(url) {
  return new Promise((res, rej) => {

    const element = document.createElement("script");
    element.src = url;
    element.type = "text/javascript";
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`);
      res(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${url}`);
      rej(true);
    };

    document.head.appendChild(element);
  })
}