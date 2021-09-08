import axios from "axios";
import * as common from "./common";
import {
  Config,
  Artifact,
  ArtifactResponse,
  IDivSrcCore,
  IdentityFields,
} from "./interfaces";


declare var __webpack_init_sharing__: any;
declare var __webpack_share_scopes__: any;
class DivSrcCore implements IDivSrcCore {
  public debug: boolean = false;
  public isBootstrapped: boolean = false;
  public artifacts: Artifact[] = [];
  public registry: any = {};
  public config?: Config;
  public zones: string[] = [];
  public identityFields: IdentityFields = {};
  public identityChangeHandlers: void[] = [];
  public mockedResponse: ArtifactResponse | undefined = undefined;
  public installations: {
    [key: string]: any;
  } = {};
  public newZones: {
    [key: string]: any;
  } = {};
  public importmaps: {
    [key: string]: any;
  } = {};

  public async import(moduleName: string) {
    const artifact: Artifact | undefined = this.getArtifact(moduleName);
    if (artifact) {
      if (this.installations[artifact.installationId]) {
        return this.installations[artifact.installationId];
      }
      await this.mountArtifactByInstallationId(artifact.installationId);
      return this.installations[artifact.installationId];
    }

    const System: any = window.System || {};
    return System.import(moduleName);
  }

  public async striptInjector(src: string, id?: string, type?: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = type || "text/javascript";
      script.async = false;
      if (id) {
        script.id = id;
      }
      script.onload = function () {
        resolve(null);
      };
      script.onerror = function (err) {
        reject(err);
      };
      script.setAttribute("crossorigin", "true");
      script.src = src;
      document.getElementsByTagName("head")[0].prepend(script);
    });
  }

  public async injectSystemJs() {
    await this.striptInjector(
      this.config?.systemJsUrl ||
      "https://divsource.s3.eu-central-1.amazonaws.com/libs/system.js",
      "systemjs"
    );
    await this.striptInjector(
      this.config?.systemJsExtrasNamed ||
      "https://unpkg.com/systemjs/dist/extras/named-register.js",
      "systemjs_extras_named"
    );
    await this.striptInjector(
      this.config?.systemJsExtrasAmd ||
      "https://unpkg.com/systemjs/dist/extras/amd.js",
      "systemjs_extras_amd"
    );
  }

  public tryInjectImportMaps() {
    if (!this.config?.injectImportmap) {
      return;
    }
    if (!this.importmaps || Object.keys(this.importmaps).length === 0) {
      return;
    }
    const script = document.createElement("script");
    script.type = "systemjs-importmap";
    script.innerText = JSON.stringify({imports: this.importmaps});
    document.getElementsByTagName("head")[0].prepend(script);
  }

  public async tagScriptImporter(artifact: Artifact) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = false;
      script.onload = function () {
        resolve(null);
      };
      script.onerror = function (err) {
        reject(err);
      };
      script.setAttribute("crossorigin", "true");
      script.src = this.generateArtifactUrl(artifact);
      document.getElementsByTagName("head")[0].prepend(script);
    });
  }
  private async es6ModuleImporter(artifact: Artifact) {
    const System: any = window.System || {};
    const src = this.generateArtifactUrl(artifact);
    return System.import(src);
  }

  public generateArtifactUrl(artifact: Artifact): string {
    if (artifact.url) {
      return artifact.url;
    }
    const baseUrl = this.generateArtifactBaseUrl(artifact);
    const fileName = artifact.fileName || "index.js";
    return `${baseUrl}/${fileName}`;
  }

  public generateArtifactBaseUrl(artifact: Artifact): string {
    const version = artifact.version || "0.0.0";
    return `${artifact.baseUrl}/${artifact.artifactId}/${version}`;
  }

  public async mountArtifactByInstallationId(installationId: string) {
    const artifact = this.getArtifactByInstallationId(installationId);
    if (!artifact) {
      common.log(`Installation not found intsallationId: ${installationId}`);
      return null;
    }
    return this.mountArtifact(artifact);
  }

  public async mountArtifact(artifact: Artifact) {
    if (
      this.registry[artifact.installationId] &&
      this.registry[artifact.installationId].isActive
    ) {
      common.log(
        `Mount From Cache: ${artifact.zone}/${artifact.installationId}`
      );
      return Promise.resolve(null);
    }

    common.log(
      `Mount From HTTP Request: ${artifact.zone}/${artifact.installationId}`
    );
    const injector = window["System"]
      ? this.es6ModuleImporter(artifact)
      : this.tagScriptImporter(artifact);
    return injector
      .then((_artifactObj: any) => {
        _artifactObj = _artifactObj.default || _artifactObj;
        if (_artifactObj) {
          this.artifacts
            .filter((f) => f.zone === artifact.zone)
            .forEach((ar) => {
              if (this.registry[ar.installationId]) {
                this.registry[ar.installationId].isActive = false;
              }
            });
          this.registry[artifact.installationId] = {
            ...artifact,
            isActive: true,
          };
          delete window[artifact.artifactId];
          this.installations[artifact.installationId] =
            _artifactObj.default || _artifactObj;
        }
      })
      .catch((err) => {
        console.log(err);
        common.error(
          `failed to fetch app for zone: ${artifact.zone}, version: ${artifact.version}. ${err.message}`
        );
        this.registry[artifact.installationId] = {
          error: "Failed to mount " + err.message ? err.message : "",
        };
      });
  }

  public async mountAllArtifacts() {
    return Promise.all(this.artifacts.map((ar) => this.mountArtifact(ar)));
  }

  public getArtifactByInstallationId(installationId: string) {
    const overrides = this.getObjectFromLocalStorage("artifacts");

    const overrideKey = Object.keys(overrides).find(
      (zone) => overrides[zone].installationId === installationId
    );
    const override = overrideKey && overrides[overrideKey];

    if (this.artifacts) {
      const artifact = this.artifacts.find(
        (f) => f.installationId === installationId
      );
      if (override) {
        return {
          ...artifact,
          ...override,
        };
      }
      return artifact;
    }
    if (override) {
      return override;
    }
    return undefined;
  }

  public addArtifact(artifact: Artifact) {
    if (!this.getArtifactByInstallationId(artifact.installationId)) {
      this.artifacts.push(artifact);
    }
  }

  public setArtifact(artifact: Artifact) {
    return this.overrideArtifactByInstallationId(artifact);
  }

  public overrideArtifactByInstallationId(artifact: Artifact) {
    if (!this.getArtifactByInstallationId(artifact.installationId)) {
      this.artifacts.push(artifact);
    } else {
      this.artifacts = this.artifacts.map((ar) => {
        if (ar.installationId === artifact.installationId) {
          return Object.assign({}, ar, artifact);
        }
        return ar;
      });
    }
  }

  public overrideArtifactById(artifact: Artifact) {
    this.artifacts = this.artifacts.map((ar) => {
      if (ar.artifactId === artifact.artifactId) {
        return Object.assign({}, ar, artifact);
      }
      return ar;
    });
  }

  public generateId(): string {
    return "-" + Math.random().toString(36).substr(2, 9);
  }

  public zoneToZoneStorageKey(zone: string): string {
    return `__zone_${zone}`;
  }

  public removeZoneLocalOverride(zone: string) {
    let overrides = this.getObjectFromLocalStorage("artifacts");
    delete overrides[zone];
    this.saveObjectToLocalStorage("artifacts", overrides);
  }

  public setZoneLocalOverride(
    zone: string,
    artifactId: string,
    version: string,
    fileName?: string,
    baseUrl?: string,
    installationId?: string
  ) {
    let obj: Artifact = {
      zone,
      artifactId,
      version,
      installationId: `installation_${this.generateId()}`,
    };
    if (fileName) {
      obj.fileName = fileName;
    }
    if (baseUrl) {
      obj.baseUrl = baseUrl;
    }
    if (installationId) {
      obj.installationId = installationId;
    }
    const artifact: Artifact | undefined = this.getArtifactByZone(zone);
    this.saveOverride({
      ...(artifact || {}),
      ...obj,
    });
  }

  public saveOverride(obj: Artifact) {
    const overrides = this.getObjectFromLocalStorage("artifacts");
    const _newOverrides = {
      ...overrides,
      [obj.zone]: obj,
    };
    this.saveObjectToLocalStorage("artifacts", _newOverrides);
  }

  public tryFindArtifactOverrideByZone(zone: string): Artifact | undefined {
    const overrides = this.getObjectFromLocalStorage("artifacts");
    return overrides[zone];
  }

  public getArtifact(zone: string): Artifact | undefined {
    return this.getArtifactByZone(zone);
  }

  public getArtifactByZone(zone: string): Artifact | undefined {
    const list: Artifact[] = (this.artifacts || []).filter(
      (a) => a.zone === zone
    );
    const resolvedOverride: Artifact | undefined =
      this.tryFindArtifactOverrideByZone(zone);
    const resolvedArtifact: Artifact | undefined = list && list[0];
    if (resolvedOverride) {
      common.log(
        `Applying local override for zone "${zone}" with params: ${JSON.stringify(
          resolvedArtifact
        )}`
      );
      return {
        ...resolvedArtifact,
        ...resolvedOverride,
      };
    }
    return resolvedArtifact;
  }

  public setMockedResponse(mocked: ArtifactResponse) {
    this.mockedResponse = mocked;
  }

  public reset() {
    this.config = undefined;
    this.registry = {};
    this.artifacts = [];
    this.zones = [];
    this.identityFields = {};
    this.identityChangeHandlers = [];
    this.mockedResponse = undefined;
  }

  private tryMapEmulatorsArrayToObject(emulatorComponents) {
    if (Array.isArray(emulatorComponents)) {
      return emulatorComponents.reduce((acc: any, next: string) => {
        acc[next] = {zone: next};
        return acc;
      }, {});
    }
    return emulatorComponents;
  }

  private fetchMap() {
    if (!this.config?.installationMapUrl) {
      return new Error("installationMapUrl param is not set");
    }
    return axios.get(this.config.installationMapUrl).then((r) => r && r.data);
  }
  public async init(config: Config): Promise<any> {
    try {
      this.debug =
        localStorage &&
        (!!localStorage.getItem("_debug") ||
          !!localStorage.getItem("divsrc_debug"));
      this.config = config;
      const response: ArtifactResponse =
        this.mockedResponse || (await this.fetchMap());
      this.artifacts = response.installations;
      this.importmaps = {
        ...(response.importmaps || {}),
        ...(config.importmaps || {}),
      };
      this.tryInjectImportMaps();

      if (this.config.injectSystemJs && !window["System"]) {
        await this.injectSystemJs();
      }

      if (config.emulators && config.emulators.length > 0) {
        const emulatedResults = await Promise.all(
          config.emulators.map((em) =>
            axios
              .get(em.url)
              .then((r) => r && r.data)
              .catch((err) => {
                console.log(err);
                return {};
              })
          )
        );
        const rules: any = config.emulators.reduce((acc, next) => {
          return {
            ...acc,
            ...this.tryMapEmulatorsArrayToObject(next.components),
          };
        }, {});

        const mappedEmulatedResults = emulatedResults.reduce((acc, next) => {
          acc = Object.assign({}, acc, next);
          return acc;
        }, {});
        this.artifacts = this.artifacts.map((ar) => {
          const rule = rules[ar.artifactId];
          const ruleIsObject = typeof rule === "object";
          if (
            mappedEmulatedResults[ar.artifactId] &&
            (rule === undefined || rule === true || ruleIsObject)
          ) {
            const _rule = ruleIsObject ? rule : {};
            const merged = {
              ...ar,
              ...mappedEmulatedResults[ar.artifactId],
              ..._rule,
            };
            delete mappedEmulatedResults[ar.artifactId];
            return merged;
          } else {
            return ar;
          }
        });
        Object.keys(mappedEmulatedResults).forEach((key) => {
          const newArt = mappedEmulatedResults[key];
          const rule = rules[key] || {};
          this.artifacts.push({
            ...newArt,
            ...rule,
          });
        });
      }
      this.zones = response.zones || [];
      this.isBootstrapped = true;
    } catch (ex) {
      console.log(ex.message);
      throw Error("Unable to fetch artifacts");
    }
    return this.artifacts;
  }

  public getNewZones(): any {
    const _zones = this.zones || [];
    _zones.forEach((z: any) => {
      if (this.newZones[z.zone]) {
        delete this.newZones[z.zone];
      }
    });
    return this.newZones;
  }

  public getObjectFromLocalStorage(key: string, nullable: boolean = false) {
    try {
      const str: any = window.localStorage.getItem(key);
      if (!str) {
        return nullable ? undefined : {};
      }
      return JSON.parse(str);
    } catch (ex) {
      return nullable ? undefined : {};
    }
  }

  public saveObjectToLocalStorage(key: string, obj: object) {
    window.localStorage.setItem(key, JSON.stringify(obj));
  }

  public identify(fields: IdentityFields) {
    this.identityFields = Object.assign({}, this.identityFields, fields);
    this.identityChangeHandlers.map((clb: any) => clb());
  }

  public onIdentityChange(callback: void) {
    if (!this.identityChangeHandlers.some((f) => f === callback)) {
      this.identityChangeHandlers.push(callback);
    }
  }

  public cleanIdentityChange(callback: void) {
    this.identityChangeHandlers = this.identityChangeHandlers.filter(
      (clb) => clb !== callback
    );
  }

  public async webpackInitSharing() {
    return __webpack_init_sharing__ && __webpack_init_sharing__("default")
  }

  public webpackShareScopes() {
    return __webpack_share_scopes__ && __webpack_share_scopes__.default;
  }

  public async webpackImport(artifactId: string, moduleName: string) {
    await this.webpackInitSharing()
    await this.import(artifactId)
    const container = window[artifactId];
    await container.init(this.webpackShareScopes());
    const factory = await container.get(moduleName);
    const Module = factory();
    return Module;
  }
}
const instance = new DivSrcCore();
if (window) {
  window["divSrcSdk"] = instance;
}
export default instance;
