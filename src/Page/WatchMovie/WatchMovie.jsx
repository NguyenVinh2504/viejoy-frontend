import { useCallback, useMemo } from 'react'
import Wrapper from '~/components/Wrapper'
import OverviewMovieDetail from '~/components/MediaDetail/OverviewMovieDetail'
import Episodes from '~/components/MediaDetail/Episodes'
import CastSlice from '~/components/MediaDetail/CastItem'
import VideoSlice from '~/components/MediaDetail/VideoSlice'
import CommentMedia from '~/components/MediaDetail/CommentMedia'
import WrapperMovieDetail from '~/components/MediaDetail/components/WrapperMovieDetail'
import TitleMovieDetail from '~/components/MediaDetail/HeaderMovieDetail/TitleMovieDetail'
import Player from './VideoLayout/components/Player'
import { useGoWatchMovie, useQueryConfig, useResetState } from '~/Hooks'
import mediaApi from '~/api/module/media.api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import decodeObject from '~/utils/decodeObject'
import videoApi from '~/api/module/video.api'
import { Box } from '@mui/material'
import { isEmpty } from 'lodash'
import DropdownSelector from '~/components/DropdownSelector'
const WatchMovie = () => {
  const queryConfig = useQueryConfig()

  const { v } = queryConfig
  const { id: mediaId, mediaType, episodeNumber, seasonNumber, episodeId } = decodeObject(v)

  const fetchMediaDetail = async () => {
    const { response, err } = await mediaApi.getDetail({
      mediaType,
      mediaId
    })
    if (response) return response
    if (err) throw err
  }

  const {
    data: mediaDetail = {},
    isPending: isMediaLoading,
    isError
  } = useQuery({
    queryKey: ['Media detail', mediaType, mediaId],
    queryFn: fetchMediaDetail,
    enabled: Boolean(mediaType && mediaId && v)
  })

  const genreNames = useMemo(() => mediaDetail?.genres?.map((item) => item.name) || [], [mediaDetail?.genres])

  const currentSeasonIndex = useMemo(
    () => mediaDetail?.seasons?.findIndex((season) => season.season_number === Number(seasonNumber)),
    [mediaDetail?.seasons, seasonNumber]
  )

  const fetchVideoInfo = async () => {
    let response = null
    if (mediaType === 'tv') {
      response = await videoApi.getVideoTV({
        mediaId,
        episodeNumber,
        seasonNumber,
        episodeId
      })
    } else {
      response = await videoApi.getVideoMovie({
        mediaId
      })
    }
    return response
  }

  const { data: videoData = {}, isLoading: isVideoLoading } = useQuery({
    queryKey: ['Video Info', mediaType, mediaId, episodeNumber, seasonNumber, episodeId],
    queryFn: fetchVideoInfo,
    placeholderData: keepPreviousData,
    enabled: Boolean(mediaType && mediaId)
  })

  // Tạo mediaKey dựa trên thông tin phim - không phụ thuộc vào server URL
  const uniqueMediaKey = useMemo(() => {
    if (!mediaId || !mediaType) return null
    if (mediaType === 'tv') {
      return `tv-${mediaId}-${episodeId}-s${seasonNumber}-e${episodeNumber}`
    }
    return `movie-${mediaId}`
  }, [mediaId, mediaType, seasonNumber, episodeNumber, episodeId])

  // Reset server index về 0 khi video_links thay đổi (chuyển phim/tập mới)
  const [selectedServerIndex, setSelectedServerIndex] = useResetState(0, videoData.video_links)

  function handleServerChange(index) {
    setSelectedServerIndex(index)
  }

  const activeServer = videoData.video_links?.[selectedServerIndex]

  // Fetch current season episodes for next episode logic
  // Dùng chung query key với EpisodesPanel để share cache
  const { data: currentSeasonData } = useQuery({
    queryKey: ['episodes-panel-season', mediaId, Number(seasonNumber)],
    queryFn: async () => {
      const { response, err } = await mediaApi.getDetailSeason({
        series_id: mediaId,
        season_number: seasonNumber
      })
      if (response) return response
      if (err) throw err
    },
    enabled: Boolean(mediaType === 'tv' && mediaId && seasonNumber)
  })

  // Next episode - derived values, không cần state
  const { handleOpen } = useGoWatchMovie()
  const episodes = currentSeasonData?.episodes || []
  const currentIndex = episodes.findIndex((ep) => ep.id === episodeId)
  const nextEpisode = currentIndex !== -1 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null
  const hasNextEpisode = mediaType !== 'tv' ? undefined : Boolean(nextEpisode)

  const handleNextEpisode = useCallback(() => {
    if (!nextEpisode) return
    handleOpen({
      id: mediaId,
      mediaType: 'tv',
      episodeId: nextEpisode.id,
      seasonNumber: nextEpisode.season_number,
      episodeNumber: nextEpisode.episode_number
    })
  }, [nextEpisode, handleOpen, mediaId])

  if (isError) {
    // Basic error handling
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Wrapper>Có lỗi xảy ra khi tải thông tin phim. Vui lòng thử lại sau.</Wrapper>
      </Box>
    )
  }

  return (
    <Wrapper>
      {/* <Typography variant='h4'>Admin Lười Nên Chưa Có Phần Xem Phim. Sẽ Cập Nhật Trong Thời Gian Sắp Tới Nha. Yêu!!!</Typography> */}
      <WrapperMovieDetail noPadding>
        <Player
          videoData={videoData}
          mediaDetail={mediaDetail}
          activeServer={activeServer}
          isLoading={isVideoLoading}
          uniqueMediaKey={uniqueMediaKey}
          mediaType={mediaType}
          servers={videoData.video_links}
          currentServerIndex={selectedServerIndex}
          onServerChange={handleServerChange}
          onNextEpisode={handleNextEpisode}
          hasNextEpisode={hasNextEpisode}
        />
        <TitleMovieDetail loading={isMediaLoading} dataDetail={mediaDetail} genres={genreNames} mediaType={mediaType} />
        {!isEmpty(videoData.video_links) && (
          <Box sx={{ p: 2, pt: 0 }}>
            <DropdownSelector
              items={videoData.video_links}
              getItemKey={(videoLink) => videoLink.url}
              getItemLabel={(videoLink) => videoLink.label}
              onItemSelect={handleServerChange}
              selectedIndex={selectedServerIndex}
            />
          </Box>
        )}
      </WrapperMovieDetail>
      <OverviewMovieDetail loading={isMediaLoading} dataDetail={mediaDetail} />
      {/* thong tin phim */}

      {/* tap phim */}
      {mediaType === 'tv' && (
        <Episodes
          seasons={mediaDetail?.seasons ?? []}
          seriesId={mediaDetail?.id ?? 0}
          isLoading={isMediaLoading}
          currentSeason={currentSeasonIndex}
        />
      )}
      {/* tap phim */}

      {/* slice dien vien */}
      <CastSlice cast={mediaDetail?.credits?.cast} loading={isMediaLoading} />
      {/* slice dien vien */}

      {/* trailer */}
      <VideoSlice videos={mediaDetail?.videos?.results} loading={isMediaLoading} />
      {/* trailer */}

      {/* comment */}
      <CommentMedia movieId={mediaId} mediaType={mediaType} />
    </Wrapper>
  )
}

export default WatchMovie
