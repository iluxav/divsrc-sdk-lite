
import sdk from '..'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter';
import {Artifact} from '../interfaces';

const mockedData = require('./mocks/installations').default
const base = 'https://api.divsrc.io'

const installations = [{
  artifactId: 'art_id_1',
  installationId: 'art_id_1_install_1',
  version: '1.0.1',
  baseUrl: 'https://api.divsrc.io',
  zone: 'SplitWidgetZone'
}]


describe('SDK - Local Overrides', function () {

  beforeAll(() => {
    const mockedInjector = jest.fn(() => {
      return Promise.resolve()
    });
    sdk.injectSystemJs = mockedInjector
  })

  beforeEach(() => {
    sdk.reset()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  test('Should override locally artifact object', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${base}/v1/installation/pbkey/map.json`).reply(200, mockedData({
      installations
    }));
    await sdk.init({
      installationMapUrl: `${base}/v1/installation/pbkey/map.json`
    })

    const artifact: Artifact | undefined = sdk.getArtifactByZone('SplitWidgetZone')
    expect(artifact).toBeDefined()
    expect(artifact?.version).toEqual('1.0.1')
    sdk.setZoneLocalOverride('SplitWidgetZone', '@some-other-artifact-id', '1.0.9999', 'someFile.js')
    const artifact2: Artifact = sdk.getArtifactByZone('SplitWidgetZone') || {} as Artifact
    const url = sdk.generateArtifactUrl(artifact2)
    expect(url).toEqual('https://api.divsrc.io/@some-other-artifact-id/1.0.9999/someFile.js')
    expect(artifact2?.version).toEqual('1.0.9999')

    sdk.removeZoneLocalOverride('SplitWidgetZone')
    const artifact3: Artifact = sdk.getArtifactByZone('SplitWidgetZone') || {} as Artifact
    expect(sdk.generateArtifactUrl(artifact3)).toEqual('https://api.divsrc.io/art_id_1/1.0.1/index.js')
    expect(artifact3?.version).toEqual('1.0.1')
  })
})


