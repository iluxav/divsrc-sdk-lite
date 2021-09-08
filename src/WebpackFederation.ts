
declare var __webpack_init_sharing__: any;
declare var __webpack_share_scopes__: any;

export function loadWebpackModuleComponent(scope, module, url) {
  return async () => {

    await loadWebpackModuleScript(url)

    await __webpack_init_sharing__("default");
    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

export function loadWebpackModuleScript(url) {
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