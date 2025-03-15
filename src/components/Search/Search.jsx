import Input from '~/components/Input'
import { CloseIcon, SearchIcon } from '~/components/Icon'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import config from '~/config'
import { useQueryConfig } from '~/Hooks'
import { debounce, omit, set } from 'lodash'
import { Box, Grow, List, ListItem, ListItemText, Paper, Popper } from '@mui/material'
import uiConfigs from '~/config/ui.config'

import { useQuery } from '@tanstack/react-query'
import mediaApi from '~/api/module/media.api'
import Image from '../Image'
import tmdbConfigs from '~/api/configs/tmdb.configs'
import parse from 'html-react-parser'
function Search({ round = false, inHeader = false }) {
  const props = {
    round
  }

  const [searchValue, setSearchValue] = useState('')
  const [valueInput, setValueInput] = useState(null)

  const [, setSearchParams] = useSearchParams()

  // eslint-disable-next-line no-unused-vars
  const { query, ...configQuery } = useQueryConfig()

  const [anchorEl, setAnchorEl] = useState(null)

  const location = useNavigate()

  const setValue = useRef(
    debounce((query) => {
      setValueInput(query)
    }, 500)
  )

  useEffect(() => {
    if (searchValue) setValue.current(searchValue)
  }, [searchValue])

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value
      setSearchValue(value)
      if (!anchorEl) {
        setAnchorEl(e.currentTarget.closest('form'))
      } else if (!value.trim() || value.startsWith(' ')) {
        setAnchorEl(null)
      }
    },
    [anchorEl]
  )

  const handleClear = useCallback(() => {
    setSearchValue('')
    setAnchorEl(null)

    setSearchParams(() => {
      // eslint-disable-next-line no-unused-vars
      const { query, ...newQuery } = configQuery
      return { ...newQuery }
    })
  }, [configQuery, setSearchParams])

  const iconRightEvent = useMemo(() => {
    return {
      onClick: handleClear,
      type: 'button'
    }
  }, [handleClear])

  const { data } = useQuery({
    queryKey: ['search-keyword', valueInput],
    queryFn: async () => {
      const response = await mediaApi.searchKeyword({ query: valueInput })
      return response
    },
    enabled: !!valueInput
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!searchValue.startsWith(' ') && searchValue.trim()) {
      location({
        pathname: config.routes.searchPage,
        search: createSearchParams({
          query: searchValue,
          ...omit(configQuery, 'v')
        }).toString()
      })
    } else if (inHeader) {
      location(config.routes.home)
    } else {
      setSearchParams(() => {
        // eslint-disable-next-line no-unused-vars
        const { query, ...newQuery } = configQuery
        return { ...newQuery }
      })
    }
  }

  const handleClick = ({ mediaType, query }) => {
    location({
      pathname: config.routes.searchPage,
      search: createSearchParams({
        ...omit(configQuery, 'v', 'media_type'),
        query,
        media_type: mediaType
      }).toString()
    })
    setSearchValue(query)
    setAnchorEl(null)
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <form onSubmit={handleSubmit}>
        <Input
          isHepperText={false}
          {...props}
          placeholder={'Tìm kiếm phim rạp, phim bộ,...'}
          leftIcon={<SearchIcon />}
          rightIcon={<CloseIcon />}
          value={searchValue}
          onChange={handleChange}
          iconRightEvent={iconRightEvent}
          iconLeftEvent={{
            type: 'submit'
          }}
        />
      </form>
      <Popper
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && data?.results.length > 0}
        sx={{
          width: '100%'
        }}
        disablePortal
        placement='bottom'
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'left bottom'
            }}
          >
            <Paper
              sx={{
                mt: 1,
                maxHeight: '80vh',
                overflow: 'auto'
              }}
            >
              <List>
                {data?.results?.map((media, index) => {
                  if (media.media_type === 'person') return
                  let query = ''
                  let mediaType = ''
                  if (typeof media === 'string') {
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(media, 'text/html')
                    const span = doc.querySelector('span')
                    mediaType = span.getAttribute('data-media-type').split('/')[1]
                    query = span.textContent
                  } else {
                    mediaType = media.media_type
                    query = media.name
                  }
                  if (mediaType === 'person') return
                  return (
                    <ListItem
                      onClick={() => handleClick({ mediaType, query })}
                      key={index}
                      sx={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        gap: 2,
                        ':hover': {
                          backgroundColor: (theme) => theme.palette.secondary.main
                        },
                        '@media (hover: none)': {
                          '&:hover': {
                            backgroundColor: 'transparent'
                          }
                        }
                      }}
                    >
                      {typeof media !== 'string' ? (
                        <>
                          <Box
                            sx={{
                              flexShrink: 0,
                              width: 30
                            }}
                          >
                            <Box sx={{ pt: 'calc(16/9*100%)', position: 'relative' }}>
                              <Box
                                sx={{ overflow: 'hidden', borderRadius: '2px', ...uiConfigs.style.positionFullSize }}
                              >
                                <Image src={tmdbConfigs.posterPath(media.poster_path)} />
                              </Box>
                            </Box>
                          </Box>
                          <ListItemText
                            sx={{
                              ...uiConfigs.style.typoLines(2)
                            }}
                            primary={`${media.name} - ${media.media_type === 'movie' ? 'Movie' : 'Tv shows'}`}
                          />
                        </>
                      ) : (
                        <ListItemText
                          sx={{
                            ...uiConfigs.style.typoLines(2)
                          }}
                          primary={parse(media)}
                        />
                      )}
                    </ListItem>
                  )
                })}
              </List>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}

export default memo(Search)
