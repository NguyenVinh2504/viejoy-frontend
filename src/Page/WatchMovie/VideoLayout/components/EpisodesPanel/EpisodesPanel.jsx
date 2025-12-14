import { memo, useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Skeleton,
  Button,
  Menu,
  MenuItem
} from '@mui/material'
import { ArrowDownIcon, ArrowUpIcon, CloseIcon, PlayIcon } from '~/components/Icon'
import Image from '~/components/Image'
import images from '~/assets/image'
import tmdbConfigs from '~/api/configs/tmdb.configs'
import { useGoWatchMovie, useQueryConfig, useSyncedState } from '~/Hooks'
import decodeObject from '~/utils/decodeObject'
import { isEmpty } from 'lodash'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import mediaApi from '~/api/module/media.api'
import uiConfigs from '~/config/ui.config'

// Custom Season Selector with disablePortal for fullscreen support
function SeasonSelector({ seasons, selectedIndex, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (index) => {
    onSelect(index)
    setAnchorEl(null)
  }

  const selectedSeason = seasons[selectedIndex]

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        onClick={handleClick}
        variant='contained'
        color='secondary'
        endIcon={open ? <ArrowUpIcon /> : <ArrowDownIcon />}
        size='medium'
        sx={{
          textTransform: 'none',
          fontSize: '0.875rem',
          '.MuiButton-endIcon': {
            ml: 1.5,
            mt: '-2px'
          },
          svg: {
            width: '16px',
            height: '16px'
          },
          display: 'flex',
          maxWidth: '100%'
        }}
      >
        <span style={{ ...uiConfigs.style.typoLines(1), textAlign: 'start' }}>
          {selectedSeason?.name || 'Chọn season'}
        </span>
      </Button>
      <Menu
        container={() => document.fullscreenElement || document.body}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '.MuiPaper-root': {
            mt: 0.5,
            bgcolor: '#2D2C2C',
            color: 'white',
            maxHeight: 300,
            '.Mui-selected': {
              background: 'rgba(255, 255, 255, 0.2)!important'
            },
            '.MuiMenuItem-root': {
              fontSize: '0.875rem',
              ':hover': {
                background: 'rgba(255, 255, 255, 0.2)'
              }
            }
          }
        }}
      >
        {seasons.map((season, index) => (
          <MenuItem key={season.season_number} selected={index === selectedIndex} onClick={() => handleSelect(index)}>
            <Typography component='span' sx={{ ...uiConfigs.style.typoLines(1) }}>
              {season.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

function EpisodesPanel({ seasons = [], seriesId, onClose }) {
  const queryConfig = useQueryConfig()
  const { v } = queryConfig
  const { episodeId: currentEpisodeId, seasonNumber: currentSeasonNumber } = decodeObject(v)
  const { handleOpen } = useGoWatchMovie()

  // Find current season index from currentSeasonNumber
  const initialSeasonIndex = useMemo(() => {
    if (!seasons?.length) return 0
    const index = seasons.findIndex((s) => s.season_number === currentSeasonNumber)
    return index >= 0 ? index : 0
  }, [seasons, currentSeasonNumber])

  // Đồng bộ selectedSeasonIndex với initialSeasonIndex khi URL thay đổi
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useSyncedState(initialSeasonIndex)

  const selectedSeason = seasons?.[selectedSeasonIndex]

  // Fetch season detail data
  const fetchSeasonDetail = useCallback(async () => {
    if (!seriesId || !selectedSeason?.season_number) return null
    const { response, err } = await mediaApi.getDetailSeason({
      series_id: seriesId,
      season_number: selectedSeason.season_number
    })
    if (response) return response
    if (err) throw err
  }, [seriesId, selectedSeason?.season_number])

  const { data: seasonData, isFetching: isSeasonLoading } = useQuery({
    queryKey: ['episodes-panel-season', seriesId, selectedSeason?.season_number],
    queryFn: fetchSeasonDetail,
    enabled: Boolean(seriesId && selectedSeason?.season_number !== undefined),
    placeholderData: keepPreviousData
  })

  const episodeList = useMemo(() => seasonData?.episodes || [], [seasonData?.episodes])

  // Tìm index của tập hiện tại
  const currentEpisodeIndex = useMemo(() => {
    return episodeList.findIndex((ep) => ep.id === currentEpisodeId)
  }, [episodeList, currentEpisodeId])

  // Ref để scroll đến tập đang xem
  const [listContainerRef, setListContainerRef] = useState(null)

  useEffect(() => {
    if (listContainerRef && currentEpisodeIndex >= 0) {
      const items = listContainerRef.querySelectorAll('[data-episode-item]')
      const targetItem = items[currentEpisodeIndex]

      if (targetItem) {
        const containerRect = listContainerRef.getBoundingClientRect()
        const itemRect = targetItem.getBoundingClientRect()

        const currentScrollTop = listContainerRef.scrollTop
        const relativeTop = itemRect.top - containerRect.top + currentScrollTop

        const newScrollTop = relativeTop - listContainerRef.clientHeight / 2 + itemRect.height / 2

        listContainerRef.scrollTo({
          top: newScrollTop,
          behavior: 'smooth'
        })
      }
    }
  }, [listContainerRef, currentEpisodeIndex])

  const handleEpisodeClick = (episode) => {
    handleOpen({
      id: episode.show_id,
      mediaType: 'tv',
      episodeId: episode.id,
      seasonNumber: episode.season_number,
      episodeNumber: episode.episode_number
    })
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 48
        }}
      >
        <Typography variant='subtitle1' fontWeight={600} noWrap sx={{ flex: 1 }}>
          Danh sách tập
        </Typography>
        <IconButton size='small' onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Season Selector */}
      {!isEmpty(seasons) && (
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <SeasonSelector seasons={seasons} selectedIndex={selectedSeasonIndex} onSelect={setSelectedSeasonIndex} />
        </Box>
      )}

      {/* Episodes List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.3)',
            borderRadius: '3px'
          }
        }}
        ref={setListContainerRef}
      >
        {isSeasonLoading ? (
          <Box sx={{ p: 1 }}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} variant='rounded' sx={{ height: 70, mb: 1 }} />
              ))}
          </Box>
        ) : isEmpty(episodeList) ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Không có tập phim
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {episodeList.map((episode) => {
              const isActive = episode.id === currentEpisodeId

              return (
                <ListItemButton
                  key={episode.id}
                  data-episode-item
                  onClick={() => handleEpisodeClick(episode)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    gap: 1.5,
                    alignItems: 'flex-start',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'action.selected' : 'action.hover'
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: 100,
                      minWidth: 100,
                      aspectRatio: '16/9',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'grey.900'
                    }}
                  >
                    <Image
                      alt={episode.name}
                      src={
                        episode?.still_path || seasonData?.poster_path
                          ? tmdbConfigs.posterPath(episode?.still_path ?? seasonData?.poster_path)
                          : images.noImage19x6
                      }
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.5)'
                        }}
                      >
                        <PlayIcon />
                      </Box>
                    )}
                  </Box>

                  {/* Info */}
                  <ListItemText
                    primary={
                      <Typography
                        variant='body2'
                        fontWeight={isActive ? 600 : 500}
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: isActive ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {`${String(episode.episode_number).padStart(2, '0')}. ${episode.name || `Tập ${episode.episode_number}`}`}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {episode.runtime ? `${episode.runtime} phút` : ''}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </ListItemButton>
              )
            })}
          </List>
        )}
      </Box>
    </Box>
  )
}

export default memo(EpisodesPanel)
