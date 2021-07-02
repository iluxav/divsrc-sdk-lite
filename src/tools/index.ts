import {Artifact, IdentityFields, IDivSrcCore} from "../interfaces";


declare global {
  namespace Express {
    interface Request { }
  }

  interface Window {
    ga: any,
    System: any, 
    __installations: any, 
    _divSrcZones: any, 
    [key: string]: any, 
    localStorage: any,
    divSrcSdk: any
  }

  interface Document {

  }
}

class DivSrcTools implements IDivSrcCore {
  divSrcSdkInstance: IDivSrcCore
  constructor(divSrcSdkInstance: IDivSrcCore) {
    this.divSrcSdkInstance = divSrcSdkInstance
  }
  import(moduleName: string): Promise<any> {
    return this.divSrcSdkInstance.import(moduleName)
  }
  generateArtifactBaseUrl(artifact: Artifact): string {
    return this.divSrcSdkInstance.generateArtifactBaseUrl(artifact)
  }
  generateArtifactUrl(artifact: Artifact): string {
    return this.divSrcSdkInstance.generateArtifactUrl(artifact)
  }
  overrideArtifactByInstallationId(artifact: Artifact) {
    return this.divSrcSdkInstance.overrideArtifactByInstallationId(artifact)
  }
  overrideArtifactById(artifact: Artifact) {
    return this.divSrcSdkInstance.overrideArtifactById(artifact)
  }
  getArtifact(zone: string): Artifact | undefined {
    return this.divSrcSdkInstance && this.divSrcSdkInstance.getArtifact(zone) 
  }
  identify(fields: IdentityFields) {
    return this.divSrcSdkInstance.identify(fields)
  }
  onIdentityChange(callback: void) {
    return this.divSrcSdkInstance.onIdentityChange(callback)
  }
  artifactRootUrl(artifact_id: string): string {
    const artifact = this.getArtifact(artifact_id)
    if (!artifact) {
      return ''
    }
    return this.generateArtifactBaseUrl(artifact)
  }
}

export default new DivSrcTools(window.divSrcSdk)