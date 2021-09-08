
export interface ArtifactResponse {
  installations: Artifact[];
  zones: string[];
  importmaps: {
    [key: string]: string;
  };
}

export type IdentityFields = {
  [key: string]: any;
};

export interface Artifact {
  installationId: string;
  baseUrl?: string;
  artifactId: string;
  zone: string;
  fileName?: string;
  hashJWT?: string;
  version: string;
  mappingRules?: any;
  url?: string;
  name?: string;
}

export interface Emulator {
  url: string;
  components:
  | {
    [key: string]: boolean | object;
  }
  | string[];
}

export interface Config {
  key?: string;
  identify?: any;
  importmaps?: {
    [key: string]: string;
  };
  installationMapUrl?: string;
  es6ModuleLoader?: boolean | undefined;
  emulators?: Emulator[];
  systemJsUrl?: string;
  systemJsExtrasAmd?: string;
  systemJsExtrasNamed?: string;
  injectSystemJs?: boolean;
  injectImportmap?: boolean;
  cdnMode?: boolean;
}

export interface IDivSrcCore {
  import(moduleName: string): Promise<any>;
  generateArtifactBaseUrl(artifact: Artifact): string;
  generateArtifactUrl(moduleName: Artifact): string;
  overrideArtifactByInstallationId(artifact: Artifact);
  overrideArtifactById(artifact: Artifact);
  getArtifact(zone: string): Artifact | undefined;
  identify(fields: IdentityFields);
  onIdentityChange(callback: void);
}
