// import '@vidstack/react/player/styles/default/theme.css';
// import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/base.css'
import { isHLSProvider, MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react'
import { memo, useEffect, useMemo, useState } from 'react'
import tmdbConfigs from '~/api/configs/tmdb.configs'
import './Player.module.css'
import { Box, Skeleton, Typography, useMediaQuery } from '@mui/material'

import style from './Player.module.css'
import VideoLayout from '../../VideoLayout'
import uiConfigs from '~/config/ui.config'
import { API_ROOT } from '~/utils/constants'
import { CustomMediaStorage } from '~/utils/customMediaStorage'
import EpisodesPanel from '../EpisodesPanel'

function Player({
  videoData,
  mediaDetail,
  activeServer,
  isLoading,
  uniqueMediaKey,
  mediaType,
  servers,
  currentServerIndex,
  onServerChange,
  onNextEpisode,
  hasNextEpisode
}) {
  const [showEpisodes, setShowEpisodes] = useState(false)

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
          onNextEpisode={onNextEpisode}
          hasNextEpisode={hasNextEpisode}
        />
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
