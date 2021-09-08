
import sdk from '..'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter';
import {Artifact} from '../interfaces';

const mockedData = require('./mocks/installations').default
const base = 'https://api.divsrc.io'
describe('SDK - Emulators', function () {
  beforeAll(() => {
    const mockedInjector = jest.fn(() => {
      return Promise.resolve()
    });
    sdk.injectSystemJs = mockedInjector
  })

  beforeEach((done) => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${base}/v1/installation/pbkey/map.json`).reply(200, mockedData({
      installations: [{
        artifactId: 'art_id_1',
        installationId: 'art_id_1_install_1',
        version: '1.2.3',
        baseUrl: 'https://api.divsrc.io',
        zone: 'zone1'
      }]
    }));
    mock.onGet(`http://localhost:5555`).reply(200, {
      '@divsrc-some-app': {
        artifactId: '@divsrc-some-app',
        version: '0.0.0',
        installationId: '@divsrc-some-app_install_2',
        baseUrl: 'http://localhost:5555/artifact'
      }
    });
    mock.onGet(`http://localhost:7777`).reply(200, {
      'art_id_1': {
        artifactId: 'art_id_1',
        version: '0.0.0',
        installationId: 'art_id_1_install_2',
        baseUrl: 'http://localhost:5555/artifact'
      }
    });
    sdk.init(`${base}/v1/installation/pbkey/map.json`, {
      emulators: [{
        url: 'http://localhost:5555',
        components: ['@divsrc-some-app']
      }, {
        url: 'http://localhost:7777',
        components: {
          'art_id_1': {zone: 'zone1'}
        }
      }]
    }).then(() => {
      done()
    }).catch(err => {
      done(err)
    })
  })

  afterEach(() => {
    sdk.reset()
  })

  test('Should add artifact', () => {
    expect(sdk.artifacts?.length).toEqual(3)
    const emulatedArtifact: Artifact | undefined = sdk.getArtifactByZone('@divsrc-some-app')
    const emulatedArtifact2: Artifact | undefined = sdk.getArtifactByZone('zone1')
    expect(emulatedArtifact).toBeDefined()
    expect(emulatedArtifact?.installationId).toEqual('@divsrc-some-app_install_2')
    expect(emulatedArtifact?.artifactId).toEqual('@divsrc-some-app')
    expect(emulatedArtifact2?.version).toEqual('0.0.0')
  })
})


