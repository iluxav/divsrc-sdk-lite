import axios from 'axios'
import {ArtifactResponse} from './interfaces'


export const cdnFetchArtifacts = async (sdk_key: string): Promise<ArtifactResponse> => {
  const map = await axios.get(`https://cdn.divsrc.io/installation/${sdk_key}/map.json`).then(r => r && r.data)
  return map;
}

declare global {
  namespace Express {
    interface Request { }
  }

  interface Window {
    ga: any,
    System: any, __installations: any, _divSrcZones: any, [key: string]: any, localStorage: any
  }

  interface Document {

  }
}