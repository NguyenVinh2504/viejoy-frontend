import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { memo, useCallback, useEffect, useState } from 'react'
import mediaApi from '~/api/module/media.api'
import EpisodesList from './EpisodesList'
import { isEmpty } from 'lodash'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import WrapperMovieDetail from '../components/WrapperMovieDetail'
import PropTypes from 'prop-types'
import CategoryMovieDetail from '../components/CategoryMovieDetail'
import Input from '~/components/Input'
import DropdownSelector from '~/components/DropdownSelector'

function Episodes({ seasons, seriesId, isLoading, currentSeason = 0 }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchNumberEp, setSearchNumberEp] = useState('')
  const handleSetSeasonNumber = useCallback((number) => {
    setSelectedIndex(number)
  }, [])

  useEffect(() => {
    setSelectedIndex(currentSeason)
  }, [currentSeason])

  const getDataDetailSeason = async () => {
    const { response, err } = await mediaApi.getDetailSeason({
      series_id: seriesId,
      season_number: seasons[selectedIndex]?.season_number
    })
    if (response) {
      return response
    }
    if (err) throw err
  }

  const {
    data: seasonDetailValue,
    isFetching
    // isPlaceholderData,
  } = useQuery({
    queryKey: ['episodes', seasons[selectedIndex]?.season_number, seriesId],
    queryFn: getDataDetailSeason,
    enabled: !isEmpty(seasons),
    placeholderData: keepPreviousData
  })

  // console.log('isPlaceholderData', isPlaceholderData, 'isFetching', isFetching, 'data', seasonDetailValue);
  return (
    <WrapperMovieDetail>
      <CategoryMovieDetail valueTitle={'Tập Phim'} />
      <Stack direction={'row'} justifyContent={'space-between'} gap={1} flexWrap={'wrap'}>
        {!isEmpty(seasons) && (
          <DropdownSelector
            items={seasons}
            selectedIndex={selectedIndex}
            onItemSelect={handleSetSeasonNumber}
            getItemKey={(item) => item.season_number}
            getItemLabel={(item) => item.name}
          />
        )}
        <Tooltip title={`${seasonDetailValue?.episodes?.length} tập`} placement='bottom-start'>
          <Box
            sx={{
              width: 'min(100px, 50%)'
            }}
          >
            <Input
              placeholder={'Tìm tập'}
              // type={'number'}
              value={searchNumberEp}
              isHepperText={false}
              inputEvent={{
                onChange: (e) => {
                  setSearchNumberEp(e.target.value)
                }
              }}
            />
          </Box>
        </Tooltip>
      </Stack>
      {!isLoading && !isFetching && isEmpty(seasonDetailValue) && (
        <Typography variant={'body1'}>Không có nội dung</Typography>
      )}
      {(isLoading || isFetching) &&
        Array(4)
          .fill(0)
          .map((item, index) => (
            <Skeleton variant={'rounded'} key={index} sx={{ my: 2, height: { xs: '110px', sm: '160px' } }} />
          ))}
      {!isLoading && !isFetching && !isEmpty(seasonDetailValue) && (
        <EpisodesList dataSeason={seasonDetailValue} searchNumberEp={searchNumberEp} currentSeason={currentSeason} />
      )}
    </WrapperMovieDetail>
  )
}
Episodes.propTypes = {
  seasons: PropTypes.array.isRequired,
  seriesId: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  currentSeason: PropTypes.number
}
export default memo(Episodes)
