import Input from '~/components/Input'
import { CloseIcon, SearchIcon } from '~/components/Icon'
import { memo, useCallback, useMemo, useState } from 'react'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import config from '~/config'
import { useQueryConfig } from '~/Hooks'
import { omit } from 'lodash'
function Search({ round = false, inHeader = false }) {
  const props = {
    round
  }

  const [searchValue, setSearchValue] = useState('')
  const [, setSearchParams] = useSearchParams()

  const location = useNavigate()

  // eslint-disable-next-line no-unused-vars
  const { query, ...configQuery } = useQueryConfig()

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value
      setSearchValue(value)
      if (!value.startsWith(' ') && value.trim()) {
        location({
          pathname: config.routes.searchPage,
          search: createSearchParams({
            query: value,
            ...omit(configQuery, 'v')
          }).toString()
        })
      } else {
        if (inHeader) {
          location(config.routes.home)
        } else {
          setSearchParams(() => {
            // eslint-disable-next-line no-unused-vars
            const { query, ...newQuery } = configQuery
            return { ...newQuery }
          })
        }
      }
    },
    [configQuery, inHeader, location, setSearchParams]
  )

  const handleClear = useCallback(() => {
    setSearchValue('')

    setSearchParams(() => {
      // eslint-disable-next-line no-unused-vars
      const { query, ...newQuery } = configQuery
      return { ...newQuery }
    })
  }, [configQuery, setSearchParams])

  const iconRightEvent = useMemo(() => {
    return {
      onClick: handleClear
    }
  }, [handleClear])
  return (
    <Input
      isHepperText={false}
      {...props}
      placeholder={'Tìm kiếm phim rạp, phim bộ,...'}
      leftIcon={<SearchIcon />}
      rightIcon={<CloseIcon />}
      value={searchValue}
      onChange={handleChange}
      iconRightEvent={iconRightEvent}
    />
  )
}

export default memo(Search)
