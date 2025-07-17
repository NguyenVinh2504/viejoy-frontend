import { Button, Menu, MenuItem, Typography } from '@mui/material'
import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '../Icon'
import uiConfigs from '~/config/ui.config'

function DropdownSelector({ items = [], selectedIndex = 0, onItemSelect, getItemLabel, getItemKey }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick = (index) => {
    onItemSelect(index)
    setAnchorEl(null)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const selectedItem = items[selectedIndex]
  const displayLabel = selectedItem ? getItemLabel(selectedItem) : ''
  return (
    <div>
      <Button
        onClick={handleClickListItem}
        variant='contained'
        color='secondary'
        endIcon={open ? <ArrowUpIcon /> : <ArrowDownIcon />}
        size='medium'
        sx={{
          textTransform: 'none',
          fontSize: '1rem',
          '.MuiButton-endIcon': {
            ml: 2,
            mt: '-2px'
          },
          svg: {
            width: '18px',
            height: '18px'
          },
          display: 'flex',
          maxWidth: '316px'
        }}
      >
        <span
          style={{
            ...uiConfigs.style.typoLines(1),
            textAlign: 'start'
          }}
        >
          {' '}
          {displayLabel}
        </span>
      </Button>
      <Menu
        id='lock-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '.MuiPaper-root': {
            borderColor: '#2d2c2c',
            mt: 2,
            bgcolor: '#2D2C2C',
            color: 'white',
            '.Mui-selected': {
              background: 'rgba(255, 255, 255, 0.2)!important'
            },
            '.MuiMenuItem-root': {
              ':hover': {
                background: 'rgba(255, 255, 255, 0.2)'
              },
              '@media (hover: none)': {
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }
            }
          }
        }}
      >
        {items.map((item, index) => (
          <MenuItem
            id='account-menu'
            key={getItemKey(item)}
            selected={index === selectedIndex}
            disabled={index === selectedIndex}
            onClick={() => handleMenuItemClick(index)}
            sx={{
              maxWidth: '316px',
              pr: 5.5
            }}
          >
            <Typography
              component={'span'}
              sx={{
                ...uiConfigs.style.typoLines(1)
              }}
            >
              {getItemLabel(item)}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default DropdownSelector
