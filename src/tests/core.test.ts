
import sdk from '..'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter';
import {Artifact} from '../interfaces';

const mockedData = require('./mocks/installations').default
const base = 'https://api.divsrc.io'
describe('SDK - Core', function () {
  beforeAll((done) => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${base}/v1/installation/pbkey/map.json`).reply(200, mockedData());
    const mockedInjector = jest.fn(() => {
      return Promise.resolve()
    });
    sdk.injectSystemJs = mockedInjector
    sdk.init({
      installationMapUrl: `${base}/v1/installation/pbkey/map.json`,
    }).then(() => {
      done()
    }).catch(err => {
      done(err)
    })
  })
  test('Should init function and fetch artifacts', () => {
    expect(sdk.installations).toEqual({})
    expect(sdk.artifacts?.length).toEqual(1);
  })

  test('Should add artifact', () => {
    const artifact: Artifact = {
      artifactId: 'art_id_1',
      installationId: 'art_id_1_install_1',
      version: '1.2.3',
      zone: 'zone1'
    }
    sdk.addArtifact(artifact)
    expect(sdk.artifacts?.length).toEqual(2);
    expect(sdk.getArtifact('zone1')).toEqual(artifact)
    expect(sdk.getArtifactByInstallationId('art_id_1_install_1')).toEqual(artifact)
    expect(sdk.getArtifactByInstallationId('art_id_1_install_2')).toBeUndefined()
  })

  test('Should mount artifact', async () => {
    const artifact: Artifact = {
      artifactId: 'art_id_1',
      installationId: 'art_id_1_install_1',
      version: '1.2.3',
      zone: 'zone1'
    }
    sdk.addArtifact(artifact)
    const mockedImporter = jest.fn(() => {
      return Promise.resolve('javascript')
    });
    sdk.tagScriptImporter = mockedImporter
    await sdk.mountArtifactByInstallationId('art_id_1_install_1')
    const calls = mockedImporter.mock.calls[0] || []
    expect(calls).toEqual([artifact])
    expect(sdk.installations[artifact.installationId]).toEqual('javascript')
    expect(sdk.registry[artifact.installationId]).toBeDefined()


    const mockedImportedFuncNeverCalled = jest.fn(() => Promise.resolve());
    sdk.tagScriptImporter = mockedImportedFuncNeverCalled
    await sdk.mountArtifactByInstallationId('art_id_1_install_1')
    expect(mockedImportedFuncNeverCalled.mock.calls.length).toEqual(0)
  })
  test('Should generate a correct artifact URL', async () => {
    const artifactWithVersion: Artifact = {
      artifactId: 'art_id_1',
      installationId: 'art_id_1_install_1',
      version: '1.2.3',
      baseUrl: 'https://api.divsrc.io',
      zone: 'zone1'
    }
    const url = sdk.generateArtifactUrl(artifactWithVersion)
    expect(url).toEqual('https://api.divsrc.io/art_id_1/1.2.3/index.js')
    expect(sdk.generateArtifactUrl({
      ...artifactWithVersion,
      fileName: 'index.min.js'
    })).toEqual('https://api.divsrc.io/art_id_1/1.2.3/index.min.js')
  })
})


