import privateClient from '../client/private.client'

const ROOTPATH = '/playback'
const videoEndpoints = {
  getVideoMovie: `${ROOTPATH}/movie`,
  getVideoTV: `${ROOTPATH}/tv`
}
const videoApi = {
  getVideoMovie: async ({ mediaId }) => await privateClient.get(`${videoEndpoints.getVideoMovie}/${mediaId}`),
  getVideoTV: async ({ mediaId, episodeNumber, seasonNumber, episodeId }) =>
    await privateClient.get(`${videoEndpoints.getVideoTV}/${mediaId}`, {
      params: {
        episode_id: episodeId,
        season: seasonNumber,
        episode: episodeNumber
      }
    })
}

export default videoApi
