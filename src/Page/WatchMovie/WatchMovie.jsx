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
import { useQueryConfig } from '~/Hooks'
import mediaApi from '~/api/module/media.api'
import { useQuery } from '@tanstack/react-query'
import decodeObject from '~/utils/decodeObject'
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
  return (
    <Wrapper>
      {/* <Typography variant='h4'>Admin Lười Nên Chưa Có Phần Xem Phim. Sẽ Cập Nhật Trong Thời Gian Sắp Tới Nha. Yêu!!!</Typography> */}
      <WrapperMovieDetail noPadding>
        <Player
          poster={dataDetail.backdrop_path}
          title={dataDetail.title}
          v={v}
          id={id}
          mediaType={mediaType}
          episodeId={episodeId}
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
        />
        <TitleMovieDetail loading={loading} dataDetail={dataDetail} genres={newGenres} mediaType={mediaType} />
      </WrapperMovieDetail>
      <OverviewMovieDetail loading={loading} dataDetail={dataDetail} />
      {/* thong tin phim */}

      {/* tap phim */}
      {mediaType === 'tv' && (
        <Episodes
          seasons={dataDetail?.seasons ?? []}
          seriesId={dataDetail?.id ?? Number('')}
          isLoading={loading}
          mediaTitle={dataDetail?.name ?? dataDetail?.title ?? ''}
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
