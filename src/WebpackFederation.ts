
declare var __webpack_init_sharing__: any;
declare var __webpack_share_scopes__: any;

class WebpackFederationPlugin {
  public async webpackInitSharing() {
    return __webpack_init_sharing__ && __webpack_init_sharing__("default")
  }

  public webpackShareScopes() {
    return __webpack_share_scopes__ && __webpack_share_scopes__.default;
  }

  public async import(artifactId: string, moduleName: string) {
    await window.divSrcSdk.import(artifactId)
    const container = window[artifactId];
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(moduleName);
    const Module = factory();
    return Module;

  }
}

export default WebpackFederationPlugin