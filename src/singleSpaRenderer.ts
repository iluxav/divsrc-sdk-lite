import * as common from './common'



class SingleSpaRenderer {
  zone: string
  sdk:any
  unloadApplication:any

  constructor(zone, sdk, unloadApplication) {
    this.zone = zone
    this.sdk = sdk
    this.unloadApplication = unloadApplication
    this.sdk.newZones[zone] = this.sdk.newZones[zone] ? this.sdk.newZones[zone] + 1 : 1
    this.sdk.onIdentityChange(this.reRender)
  }

  app() {
    return this.render()
  }

  render() {
    const artifact = this.sdk.getArtifact(this.zone)
    artifact && common.log(`Single Spa Render Artifact ${this.zone}/${artifact.installationId}`)
    return artifact && artifact.installationId
  }

  reRender() {
    this.unloadApplication(this.zone, {waitForUnmount: false})
  }

  reset() {
    this.sdk.cleanIdentityChange(this.reRender);
  }

}



export default SingleSpaRenderer