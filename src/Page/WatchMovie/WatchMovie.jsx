import { useCallback, useMemo, useState } from 'react'
import Wrapper from '~/components/Wrapper'
import OverviewMovieDetail from '~/components/MediaDetail/OverviewMovieDetail'
import Episodes from '~/components/MediaDetail/Episodes'
import CastSlice from '~/components/MediaDetail/CastItem'
import VideoSlice from '~/components/MediaDetail/VideoSlice'
import CommentMedia from '~/components/MediaDetail/CommentMedia'
import WrapperMovieDetail from '~/components/MediaDetail/components/WrapperMovieDetail'
import TitleMovieDetail from '~/components/MediaDetail/HeaderMovieDetail/TitleMovieDetail'
import Player from './VideoLayout/components/Player'
import { useQueryConfig } from '~/Hooks'
import mediaApi from '~/api/module/media.api'
import { useQuery } from '@tanstack/react-query'
import decodeObject from '~/utils/decodeObject'
import videoApi from '~/api/module/video.api'
import DropdownSelector from '~/components/DropdownSelector'
import { Box } from '@mui/material'
import { isEmpty } from 'lodash'
const WatchMovie = () => {
  const queryConfig = useQueryConfig()

  const { v } = queryConfig
  const { id, mediaType, episodeNumber, seasonNumber, episodeId } = decodeObject(v)
  // console.log(obj);

  // console.log(id, mediaType, episodeNumber, seasonNumber, episodeId);

  const getDataDetail = useCallback(async () => {
    const { response, err } = await mediaApi.getDetail({
      mediaType,
      mediaId: id
    })
    if (response) return response
    if (err) throw err
  }, [id, mediaType])

  const { data: dataDetail = {}, isPending: loading } = useQuery({
    queryKey: ['Media detail', mediaType, id],
    queryFn: getDataDetail,
    enabled: Boolean(mediaType && id && v)
  })

  const newGenres = useMemo(() => dataDetail?.genres?.map((item) => item.name) || [], [dataDetail?.genres])
  const indexSeason = useMemo(
    () => dataDetail?.seasons?.findIndex((season) => season.season_number === Number(seasonNumber)),
    [dataDetail?.seasons, seasonNumber]
  )
  // const mediaTypeDetail = 'movie';
  // const loading = false;
  // const id = 1114894;
  // const newGenres = useMemo(
  //     () => dataDetail?.genres?.map((item) => item.name) || [],
  //     [],
  // );

  // useEffect(() => {
  //   console.log(
  //     're-render',
  //     dataDetail?.seasons?.findIndex((season) => season.season_number === Number(seasonNumber))
  //   )
  // })

  const getVideoInfo = useCallback(async () => {
    let response = null
    if (mediaType === 'tv') {
      response = await videoApi.getVideoTV({
        mediaId: id,
        episodeNumber,
        seasonNumber,
        episodeId
      })
    } else {
      response = await videoApi.getVideoMovie({
        mediaId: id
      })
    }
    return response
  }, [id, mediaType, episodeNumber, seasonNumber, episodeId])

  const { data: videoInfo = {}, isLoading } = useQuery({
    queryKey: ['Video Info', mediaType, id, episodeNumber, seasonNumber, episodeId],
    queryFn: getVideoInfo,
    enabled: Boolean(mediaType && id)
  })

  const [currentServerIndex, setCurrentServerIndex] = useState(0)

  function handleChangeServer(index) {
    setCurrentServerIndex(index)
  }
  const currentServer = videoInfo.video_links?.[currentServerIndex]

  return (
    <Wrapper>
      {/* <Typography variant='h4'>Admin Lười Nên Chưa Có Phần Xem Phim. Sẽ Cập Nhật Trong Thời Gian Sắp Tới Nha. Yêu!!!</Typography> */}
      <WrapperMovieDetail noPadding>
        <Player
          poster={videoInfo.poster_path}
          title={videoInfo.title || videoInfo.name}
          currentServer={currentServer}
          isLoading={isLoading}
          tracks={videoInfo.subtitle_links}
        />
        <TitleMovieDetail loading={loading} dataDetail={dataDetail} genres={newGenres} mediaType={mediaType} />
        {!isEmpty(videoInfo.video_links) && (
          <Box sx={{ p: 2, pt: 0 }}>
            <DropdownSelector
              items={videoInfo.video_links}
              getItemKey={(videoLink) => videoLink.url}
              getItemLabel={(videoLink) => videoLink.label}
              onItemSelect={handleChangeServer}
              selectedIndex={currentServerIndex}
            />
          </Box>
        )}
      </WrapperMovieDetail>
      <OverviewMovieDetail loading={loading} dataDetail={dataDetail} />
      {/* thong tin phim */}

      {/* tap phim */}
      {mediaType === 'tv' && (
        <Episodes
          seasons={dataDetail?.seasons ?? []}
          seriesId={dataDetail?.id ?? Number('')}
          isLoading={loading}
          currentSeason={indexSeason}
        />
      )}
      {/* tap phim */}

      {/* slice dien vien */}
      <CastSlice cast={dataDetail?.credits?.cast} loading={loading} />
      {/* slice dien vien */}

      {/* trailer */}
      <VideoSlice videos={dataDetail?.videos?.results} loading={loading} />
      {/* trailer */}

      {/* comment */}
      <CommentMedia movieId={id} mediaType={mediaType} />
    </Wrapper>
  )
}

export default WatchMovie
