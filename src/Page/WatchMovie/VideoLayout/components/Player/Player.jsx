// import '@vidstack/react/player/styles/default/theme.css';
// import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/base.css'
import { isHLSProvider, MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react'
import { memo, useEffect, useMemo, useState, useCallback } from 'react'
import tmdbConfigs from '~/api/configs/tmdb.configs'
import './Player.module.css'
import { Box, Skeleton, Typography, useMediaQuery } from '@mui/material'

import style from './Player.module.css'
import VideoLayout from '../../VideoLayout'
import uiConfigs from '~/config/ui.config'
import { API_ROOT } from '~/utils/constants'
import { CustomMediaStorage } from '~/utils/customMediaStorage'
import EpisodesPanel from '../EpisodesPanel'
import NextEpisodeButton from '../NextEpisodeButton'
import { useQueryConfig } from '~/Hooks'
import decodeObject from '~/utils/decodeObject'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import mediaApi from '~/api/module/media.api'

function Player({
  videoData,
  mediaDetail,
  activeServer,
  isLoading,
  uniqueMediaKey,
  mediaType,
  servers,
  currentServerIndex,
  onServerChange
}) {
  const [showEpisodes, setShowEpisodes] = useState(false)

  // Get current episode info from URL
  const queryConfig = useQueryConfig()
  const { v } = queryConfig
  const { episodeId: currentEpisodeId, seasonNumber: currentSeasonNumber } = decodeObject(v)

  // Destructure needed values
  const {
    poster_path: posterUrl,
    title: videoTitle,
    name: videoName,
    subtitle_links: subtitleTracks = []
  } = videoData || {}
  const displayTitle = videoTitle || videoName
  const { seasons: seasonList, id: seriesId } = mediaDetail || {}

  // Tạo custom storage instance - chỉ tạo lại khi mediaKey thay đổi
  const customStorage = useMemo(() => {
    if (!uniqueMediaKey) return null
    return new CustomMediaStorage(uniqueMediaKey)
  }, [uniqueMediaKey])

  // Chỉ hiện panel episodes khi là TV show
  const isTvShow = mediaType === 'tv'

  // Fetch current season detail to get episode list for next episode
  const fetchSeasonDetail = useCallback(async () => {
    if (!seriesId || currentSeasonNumber === undefined) return null
    const { response, err } = await mediaApi.getDetailSeason({
      series_id: seriesId,
      season_number: currentSeasonNumber
    })
    if (response) return response
    if (err) throw err
  }, [seriesId, currentSeasonNumber])

  const { data: seasonData } = useQuery({
    queryKey: ['player-season-detail', seriesId, currentSeasonNumber],
    queryFn: fetchSeasonDetail,
    enabled: Boolean(isTvShow && seriesId && currentSeasonNumber !== undefined),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  })

  // Find next episode
  const nextEpisode = useMemo(() => {
    if (!seasonData?.episodes || !currentEpisodeId) return null

    const episodes = seasonData.episodes
    const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisodeId)

    // Return next episode if exists
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      return episodes[currentIndex + 1]
    }

    return null
  }, [seasonData?.episodes, currentEpisodeId])

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [activeServer?.url])

  const isMobile = useMediaQuery('(max-width: 767.98px)')

  if (!activeServer) {
    return (
      <Box
        sx={{
          width: '100%',
          pt: 'calc(9/16*100%)',
          backgroundColor: 'black',
          position: 'relative'
        }}
      >
        {isLoading ? (
          <Skeleton variant='rounded' sx={{ ...uiConfigs.style.positionFullSize }} />
        ) : (
          <Typography
            variant='h5'
            component={'p'}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4
            }}
          >
            Phim sẽ được cập nhật trong thời gian sớm nhất. Xin cảm ơn!
          </Typography>
        )}
      </Box>
    )
  }
  const processedTracks = subtitleTracks.map((track) => {
    if (track.source === 'upload') {
      const r2Key = new URLSearchParams()
      r2Key.set('r2_key', track.r2_key)
      return {
        ...track,
        src: `${API_ROOT}/api/v1/subtitle?${r2Key.toString()}`
      }
    }
    return {
      ...track,
      src: track.url
    }
  })

  return (
    <MediaPlayer
      src={activeServer.url}
      poster={tmdbConfigs.backdropPath(posterUrl)}
      viewType='video'
      streamType='on-demand'
      logLevel='warn'
      playsInline
      title={displayTitle}
      storage={customStorage}
      className={`player ${style.player}`}
      autoPlay
      onProviderChange={function onProviderChange(provider) {
        if (isHLSProvider(provider)) {
          provider.config = {
            enableWorker: false
          }
        }
      }}
    >
      <Box
        sx={{
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <MediaProvider>
          <Poster className={style.poster} />
          {processedTracks.map((track) => (
            <Track src={track.src} label={track.label} kind='subtitles' lang={track.lang} key={track._id} />
          ))}
        </MediaProvider>
        <VideoLayout
          canShowEpisodes={isTvShow}
          showEpisodes={showEpisodes}
          onToggleEpisodes={() => setShowEpisodes((prev) => !prev)}
          servers={servers}
          currentServerIndex={currentServerIndex}
          onServerChange={onServerChange}
        />
        {/* Next Episode Button - only for TV shows */}
        {isTvShow && (
          <NextEpisodeButton nextEpisode={nextEpisode} seasonPosterPath={seasonData?.poster_path} seriesId={seriesId} />
        )}
      </Box>
      {/* Episodes Panel - chỉ hiện khi là TV show */}
      {!isMobile && isTvShow && (
        <Box
          sx={{
            height: '100%',
            width: showEpisodes ? { xs: 250, sm: 270, md: 320, lg: 360 } : 0,
            overflow: 'hidden',
            transition: 'width 0.3s ease-in-out'
          }}
        >
          <EpisodesPanel seasons={seasonList} seriesId={seriesId} onClose={() => setShowEpisodes(false)} />
        </Box>
      )}
    </MediaPlayer>
  )
}

export default memo(Player)
