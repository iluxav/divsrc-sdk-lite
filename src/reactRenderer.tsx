import React from "react";
import * as common from './common'


const isBrowser = typeof process === 'object'

class ReactRenderer {
  sdk: any
  constructor(sdk) {
    this.sdk = sdk
  }

  import(zone) {
    const { Renderer } = this
    this.sdk.newZones[zone] = this.sdk.newZones[zone] ? this.sdk.newZones[zone] + 1 : 1
    return (props) => <Renderer zone={zone} {...props} sdk={this.sdk} />
  }

  Renderer(props) {

    const [loaded, setLoaded] = React.useState({ artifactId: '' })

    const handleIdentityChange = React.useCallback(() => {
      const artifact = props.sdk.getArtifact(props.zone)
      artifact && common.log(`Render Artifact ${props.zone}/${artifact.installationId}`)
      artifact && props.sdk.mountArtifactByInstallationId(artifact.installationId).then(() => {
        setTimeout(() => {
          setLoaded({ ...artifact })
        }, 0)
      }).catch(err => {
        console.error(`[DivSrc] Error:`, err)
        setLoaded({ artifactId: null, installationId: null })
      })
    })

    React.useEffect(() => {
      props.sdk.onIdentityChange(handleIdentityChange)
      return function cleanup() {
        props.sdk.cleanIdentityChange(handleIdentityChange);
      }
    }, [])

    React.useEffect(handleIdentityChange, [props.zone])


    if (!loaded.installationId) {
      return null
    }

    const Component = props.sdk.installations && props.sdk.installations[loaded.installationId];
    if (!Component) {
      common.log(`Warning: Unable to locate artifact id: "${loaded.artifactId}", installation: "${loaded.installationId}"`)
      return null
    }
    if (isBrowser && window.postRender) {
      setTimeout(() => {
        window.postRender(loaded)
      }, 100)
    }
    return (
      <div
        divsrc-version={loaded.version}
        divsrc-artifact-id={loaded.artifactId}
        divsrc-installation-id={loaded.installationId}
        divsrc-zone={props.zone}>
        <Component {...props} />
      </div>
    )
  }
}



export default ReactRenderer